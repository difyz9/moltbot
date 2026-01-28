/**
 * WeChat Work (WeCom) Channel Plugin Implementation.
 */

import type { ChannelPlugin } from "clawdbot/plugin-sdk";
import {
  emptyPluginConfigSchema,
  buildChannelConfigSchema,
} from "clawdbot/plugin-sdk";

import type {
  ResolvedWeComAccount,
  WeComAccountConfig,
  WeComTargetId,
  WeComGroupId,
} from "./types.js";
import { getWeComRuntime } from "./runtime.js";

const meta = {
  id: "wecom" as const,
  label: "WeChat Work",
  selectionLabel: "WeChat Work (WeCom)",
  detailLabel: "WeCom Bot",
  docsPath: "/channels/wecom",
  docsLabel: "wecom",
  blurb: "WeChat Work enterprise channel with webhook support.",
  systemImage: "building.2",
  order: 16,
  aliases: ["we-chat-work", "qiye"],
};

/**
 * List all configured WeCom account IDs.
 */
function listWeComAccountIds(cfg: Record<string, unknown>): string[] {
  const accounts = cfg.accounts as Record<string, WeComAccountConfig> | undefined;
  if (!accounts) return [];
  return Object.keys(accounts).filter((id) => accounts[id]?.enabled !== false);
}

/**
 * Resolve WeCom account configuration.
 */
function resolveWeComAccount({
  cfg,
  accountId,
}: {
  cfg: Record<string, unknown>;
  accountId?: string;
}): ResolvedWeComAccount {
  const accounts = cfg.accounts as Record<string, WeComAccountConfig> | undefined;
  const account = accounts?.[accountId || "default"];

  if (!account) {
    throw new Error(`WeCom account not found: ${accountId || "default"}`);
  }

  return {
    id: accountId || "default",
    enabled: account.enabled !== false,
    name: account.name || `WeCom ${accountId || "default"}`,
    corpId: account.corpId || "",
    agentId: String(account.agentId || ""),
    secret: account.secret || "",
    accessToken: account.accessToken || "",
    apiType: account.apiType || "webhook",
    webhookUrl: account.webhookUrl,
    webhookToken: account.webhookToken,
    encodingAESKey: account.encodingAESKey,
    callbackUrl: account.callbackUrl,
    verifySsl: account.verifySsl !== false,
    timeoutSeconds: account.timeoutSeconds ?? 30,
    proxy: account.proxy,
    dmPolicy: (account.dmPolicy as any) ?? "pairing",
    groupPolicy: (account.groupPolicy as any) ?? "open",
    allowFrom: (account.allowFrom as string[]) ?? [],
    groupAllowFrom: (account.groupAllowFrom as string[]) ?? [],
    groups: (account.groups as Record<string, any>) ?? {},
    historyLimit: account.historyLimit ?? 20,
    dmHistoryLimit: account.dmHistoryLimit ?? 10,
    textChunkLimit: account.textChunkLimit ?? 2048,
    chunkMode: account.chunkMode ?? "length",
    blockStreaming: account.blockStreaming ?? true,
    mediaMaxMb: account.mediaMaxMb ?? 20,
  };
}

/**
 * Resolve default WeCom account ID.
 */
function resolveDefaultWeComAccountId(cfg: Record<string, unknown>): string {
  const accountIds = listWeComAccountIds(cfg);
  if (accountIds.length === 0) return "default";
  if (accountIds.length === 1) return accountIds[0];
  return cfg.defaultAccountId as string || accountIds[0];
}

/**
 * Check if WeCom account is configured.
 */
function isWeComAccountConfigured(account: ResolvedWeComAccount): boolean {
  return account.enabled && !!account.corpId && !!account.agentId && !!account.secret;
}

/**
 * Describe WeCom account.
 */
function describeWeComAccount(account: ResolvedWeComAccount): {
  name: string;
  label: string;
  status: string;
} {
  return {
    name: account.id,
    label: account.name,
    status: account.enabled ? "enabled" : "disabled",
  };
}

/**
 * Resolve allow from list for WeCom account.
 */
function resolveWeComAllowFrom({
  cfg,
  accountId,
}: {
  cfg: Record<string, unknown>;
  accountId?: string;
}): string[] {
  const accounts = cfg.accounts as Record<string, WeComAccountConfig> | undefined;
  const account = accounts?.[accountId || "default"];
  return (account?.allowFrom as string[]) ?? [];
}

/**
 * Format allow from entries.
 */
function formatWeComAllowFrom({ allowFrom }: { allowFrom: string[] }): string[] {
  return allowFrom
    .map((entry) => String(entry).trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^(wecom|we-chat-work|qiye):/i, "").toLowerCase());
}

/**
 * Normalize WeCom messaging target.
 */
function normalizeWeComTarget(target: string): WeComTargetId {
  const normalized = target.trim();
  if (normalized.startsWith("wecom:") || normalized.startsWith("we-chat-work:") || normalized.startsWith("qiye:")) {
    return normalized.split(":").slice(1).join(":") || normalized;
  }
  return normalized;
}

/**
 * Check if a string looks like a WeCom target ID.
 */
function looksLikeWeComTargetId(target: string): boolean {
  const normalized = target.trim();
  if (normalized.startsWith("wecom:") || normalized.startsWith("we-chat-work:") || normalized.startsWith("qiye:")) {
    return true;
  }
  // WeCom user IDs are typically longer strings
  return normalized.length >= 6 && /^[a-zA-Z0-9_-]+$/.test(normalized);
}

/**
 * WeCom channel plugin.
 */
export const wecomPlugin: ChannelPlugin<ResolvedWeComAccount> = {
  id: "wecom",
  meta,
  capabilities: {
    chatTypes: ["direct", "group"],
    polls: false,
    reactions: false,
    edit: false,
    unsend: false,
    reply: true,
    effects: false,
    groupManagement: false,
    threads: false,
    media: true,
    nativeCommands: false,
    blockStreaming: true,
  },
  configSchema: buildChannelConfigSchema({
    type: "object",
    properties: {
      accounts: {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            enabled: { type: "boolean" },
            name: { type: "string" },
            corpId: { type: "string" },
            agentId: { type: "string" },
            secret: { type: "string" },
            secretFile: { type: "string" },
            accessToken: { type: "string" },
            accessTokenFile: { type: "string" },
            apiType: { type: "string", enum: ["webhook", "callback"] },
            webhookUrl: { type: "string" },
            webhookToken: { type: "string" },
            encodingAESKey: { type: "string" },
            callbackUrl: { type: "string" },
            verifySsl: { type: "boolean" },
            timeoutSeconds: { type: "number" },
            allowFrom: {
              type: "array",
              items: { type: "string" },
            },
            groupPolicy: { type: "string", enum: ["open", "disabled", "allowlist"] },
            groupAllowFrom: {
              type: "array",
              items: { type: "string" },
            },
            groups: { type: "object" },
            historyLimit: { type: "number" },
            dmHistoryLimit: { type: "number" },
            dmPolicy: { type: "string", enum: ["pairing", "allowlist", "open", "disabled"] },
            textChunkLimit: { type: "number" },
            chunkMode: { type: "string", enum: ["length", "newline"] },
            blockStreaming: { type: "boolean" },
            mediaMaxMb: { type: "number" },
            proxy: { type: "string" },
          },
        },
      },
      defaultAccountId: { type: "string" },
    },
  }),
  config: {
    listAccountIds: (cfg) => listWeComAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveWeComAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultWeComAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const accounts = cfg.accounts as Record<string, WeComAccountConfig> | {};
      if (!accounts[accountId]) {
        accounts[accountId] = { enabled };
      } else {
        accounts[accountId]!.enabled = enabled;
      }
    },
    deleteAccount: ({ cfg, accountId }) => {
      const accounts = cfg.accounts as Record<string, WeComAccountConfig>;
      delete accounts[accountId];
    },
    isConfigured: (account) => isWeComAccountConfigured(account),
    describeAccount: (account) => describeWeComAccount(account),
    resolveAllowFrom: ({ cfg, accountId }) => resolveWeComAllowFrom({ cfg, accountId }),
    formatAllowFrom: ({ allowFrom }) => formatWeComAllowFrom({ allowFrom }),
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId }) => {
      const accounts = cfg.accounts as Record<string, WeComAccountConfig> | undefined;
      const account = accounts?.[accountId || "default"];
      const dmPolicy = (account?.dmPolicy as string) ?? "pairing";
      return {
        mode: dmPolicy as "open" | "pairing" | "allowlist" | "disabled",
      };
    },
  },
  groups: {
    resolveRequireMention: ({ cfg, groupId }) => {
      const accounts = cfg.accounts as Record<string, WeComAccountConfig> | undefined;
      const defaultAccount = accounts?.default;
      const groups = (defaultAccount?.groups as Record<string, { requireMention?: boolean }>) ?? {};
      const groupConfig = groups[groupId] ?? groups["*"];
      return groupConfig?.requireMention !== false;
    },
    resolveToolPolicy: () => "open" as const,
  },
  messaging: {
    normalizeTarget: normalizeWeComTarget,
    targetResolver: {
      looksLikeId: looksLikeWeComTargetId,
      hint: "<userId|departmentId|tagId>",
    },
  },
  directory: {
    self: async () => null,
    listPeers: async () => [],
    listGroups: async () => [],
  },
  outbound: {
    deliveryMode: "direct",
    textChunkLimit: 2048,
    sendText: async ({ to, text, accountId, deps }) => {
      const runtime = getWeComRuntime();
      const logger = deps?.logger ?? console;

      logger.log(`[WeCom] Sending text to ${to} via account ${accountId}`);
      // Implementation would use WeCom API to send the message
      return { messageId: `wecom-${Date.now()}` };
    },
    sendMedia: async ({ to, text, mediaUrl, accountId, deps }) => {
      const runtime = getWeComRuntime();
      const logger = deps?.logger ?? console;

      logger.log(`[WeCom] Sending media to ${to} via account ${accountId}`);
      // Implementation would use WeCom API to send media
      return { messageId: `wecom-${Date.now()}` };
    },
  },
  status: {
    defaultRuntime: {
      connected: false,
      lastError: null,
    },
    collectStatusIssues: async ({ account }) => {
      const issues: string[] = [];
      if (!account.enabled) {
        issues.push("Account is disabled");
      }
      if (!account.corpId) {
        issues.push("Missing Corp ID");
      }
      if (!account.agentId) {
        issues.push("Missing Agent ID");
      }
      if (!account.secret) {
        issues.push("Missing Secret");
      }
      if (account.apiType === "webhook" && !account.webhookUrl) {
        issues.push("Webhook URL required for webhook mode");
      }
      return issues;
    },
    probeAccount: async ({ account, timeoutMs }) => {
      // Implement connection probe using WeCom API
      return {
        connected: false,
        latency: 0,
        error: null,
      };
    },
    auditAccount: async ({ account, cfg, timeoutMs }) => {
      return {
        configured: isWeComAccountConfigured(account),
        reachable: false,
        errors: [],
        warnings: [],
      };
    },
  },
  gateway: {
    startAccount: async (ctx) => {
      const { accountId, cfg, deps } = ctx;
      const account = resolveWeComAccount({ cfg, accountId });
      const logger = deps?.logger ?? console;

      logger.log(`[WeCom] Starting account ${account.name}...`);
      // Implementation would initialize and start WeCom API client
      return { started: true };
    },
    stopAccount: async ({ accountId, deps }) => {
      const logger = deps?.logger ?? console;
      logger.log(`[WeCom] Stopping account ${accountId}...`);
      // Implementation would stop WeCom API client
      return { stopped: true };
    },
  },
};
