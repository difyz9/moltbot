/**
 * WeChat Channel Plugin Implementation.
 */

import type { ChannelPlugin } from "clawdbot/plugin-sdk";
import {
  emptyPluginConfigSchema,
  buildChannelConfigSchema,
} from "clawdbot/plugin-sdk";

import type {
  ResolvedWeChatAccount,
  WeChatTargetId,
  WeChatGroupId,
} from "./types.js";
import { getWeChatRuntime } from "./runtime.js";

const meta = {
  id: "wechat" as const,
  label: "WeChat",
  selectionLabel: "WeChat (Bot API)",
  detailLabel: "WeChat Bot",
  docsPath: "/channels/wechat",
  docsLabel: "wechat",
  blurb: "WeChat Official Bot API with QR login support.",
  systemImage: "message.circle",
  order: 15,
  aliases: ["wx", "weixin"],
};

/**
 * List all configured WeChat account IDs.
 */
function listWeChatAccountIds(cfg: Record<string, unknown>): string[] {
  const accounts = cfg.accounts as Record<string, WeChatAccountConfig> | undefined;
  if (!accounts) return [];
  return Object.keys(accounts).filter((id) => accounts[id]?.enabled !== false);
}

/**
 * Resolve WeChat account configuration.
 */
function resolveWeChatAccount({
  cfg,
  accountId,
}: {
  cfg: Record<string, unknown>;
  accountId?: string;
}): ResolvedWeChatAccount {
  const accounts = cfg.accounts as Record<string, WeChatAccountConfig> | undefined;
  const account = accounts?.[accountId || "default"];

  if (!account) {
    throw new Error(`WeChat account not found: ${accountId || "default"}`);
  }

  return {
    id: accountId || "default",
    enabled: account.enabled !== false,
    name: account.name || `WeChat ${accountId || "default"}`,
    puppet: account.puppet || "wechaty-puppet-wechat",
    puppetOptions: account.puppetOptions,
    qrCode: account.qrCode !== false,
  };
}

/**
 * Resolve default WeChat account ID.
 */
function resolveDefaultWeChatAccountId(cfg: Record<string, unknown>): string {
  const accountIds = listWeChatAccountIds(cfg);
  if (accountIds.length === 0) return "default";
  if (accountIds.length === 1) return accountIds[0];
  return cfg.defaultAccountId as string || accountIds[0];
}

/**
 * Check if WeChat account is configured.
 */
function isWeChatAccountConfigured(account: ResolvedWeChatAccount): boolean {
  return account.enabled;
}

/**
 * Describe WeChat account.
 */
function describeWeChatAccount(account: ResolvedWeChatAccount): {
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
 * Resolve allow from list for WeChat account.
 */
function resolveWeChatAllowFrom({
  cfg,
  accountId,
}: {
  cfg: Record<string, unknown>;
  accountId?: string;
}): string[] {
  const accounts = cfg.accounts as Record<string, WeChatAccountConfig> | undefined;
  const account = accounts?.[accountId || "default"];
  return (account?.allowFrom as string[]) ?? [];
}

/**
 * Format allow from entries.
 */
function formatWeChatAllowFrom({ allowFrom }: { allowFrom: string[] }): string[] {
  return allowFrom
    .map((entry) => String(entry).trim())
    .filter(Boolean)
    .map((entry) => entry.toLowerCase());
}

/**
 * Normalize WeChat messaging target.
 */
function normalizeWeChatTarget(target: string): WeChatTargetId {
  const normalized = target.trim();
  if (normalized.startsWith("wechat:") || normalized.startsWith("wx:")) {
    return normalized.split(":")[1] || normalized;
  }
  return normalized;
}

/**
 * Check if a string looks like a WeChat target ID.
 */
function looksLikeWeChatTargetId(target: string): boolean {
  const normalized = target.trim();
  if (normalized.startsWith("wechat:") || normalized.startsWith("wx:")) {
    return true;
  }
  // WeChat user IDs are typically longer strings
  return normalized.length >= 6 && /^[a-zA-Z0-9_-]+$/.test(normalized);
}

/**
 * WeChat channel plugin.
 */
export const wechatPlugin: ChannelPlugin<ResolvedWeChatAccount> = {
  id: "wechat",
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
            puppet: { type: "string" },
            puppetOptions: { type: "object" },
            qrCode: { type: "boolean" },
            allowFrom: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
      defaultAccountId: { type: "string" },
    },
  }),
  config: {
    listAccountIds: (cfg) => listWeChatAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveWeChatAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultWeChatAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const accounts = cfg.accounts as Record<string, WeChatAccountConfig> | {};
      if (!accounts[accountId]) {
        accounts[accountId] = { enabled };
      } else {
        accounts[accountId]!.enabled = enabled;
      }
    },
    deleteAccount: ({ cfg, accountId }) => {
      const accounts = cfg.accounts as Record<string, WeChatAccountConfig>;
      delete accounts[accountId];
    },
    isConfigured: (account) => isWeChatAccountConfigured(account),
    describeAccount: (account) => describeWeChatAccount(account),
    resolveAllowFrom: ({ cfg, accountId }) => resolveWeChatAllowFrom({ cfg, accountId }),
    formatAllowFrom: ({ allowFrom }) => formatWeChatAllowFrom({ allowFrom }),
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId }) => {
      const accounts = cfg.accounts as Record<string, WeChatAccountConfig> | undefined;
      const account = accounts?.[accountId || "default"];
      const dmPolicy = (account?.dmPolicy as string) ?? "pairing";
      return {
        mode: dmPolicy as "open" | "pairing" | "allowlist" | "disabled",
      };
    },
  },
  groups: {
    resolveRequireMention: ({ cfg, groupId }) => {
      const accounts = cfg.accounts as Record<string, WeChatAccountConfig> | undefined;
      const defaultAccount = accounts?.default;
      const groups = (defaultAccount?.groups as Record<string, { requireMention?: boolean }>) ?? {};
      const groupConfig = groups[groupId] ?? groups["*"];
      return groupConfig?.requireMention !== false;
    },
    resolveToolPolicy: () => "open" as const,
  },
  messaging: {
    normalizeTarget: normalizeWeChatTarget,
    targetResolver: {
      looksLikeId: looksLikeWeChatTargetId,
      hint: "<userId|roomId>",
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
      const runtime = getWeChatRuntime();
      const logger = deps?.logger ?? console;

      logger.log(`[WeChat] Sending text to ${to} via account ${accountId}`);
      // Implementation would use WeChaty to send the message
      return { messageId: `wechat-${Date.now()}` };
    },
    sendMedia: async ({ to, text, mediaUrl, accountId, deps }) => {
      const runtime = getWeChatRuntime();
      const logger = deps?.logger ?? console;

      logger.log(`[WeChat] Sending media to ${to} via account ${accountId}`);
      // Implementation would use WeChaty to send media
      return { messageId: `wechat-${Date.now()}` };
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
      return issues;
    },
    probeAccount: async ({ account, timeoutMs }) => {
      // Implement connection probe using WeChaty
      return {
        connected: false,
        latency: 0,
        error: null,
      };
    },
    auditAccount: async ({ account, cfg, timeoutMs }) => {
      return {
        configured: isWeChatAccountConfigured(account),
        reachable: false,
        errors: [],
        warnings: [],
      };
    },
  },
  gateway: {
    startAccount: async (ctx) => {
      const { accountId, cfg, deps } = ctx;
      const account = resolveWeChatAccount({ cfg, accountId });
      const logger = deps?.logger ?? console;

      logger.log(`[WeChat] Starting account ${account.name}...`);
      // Implementation would initialize and start WeChaty bot
      return { started: true };
    },
    stopAccount: async ({ accountId, deps }) => {
      const logger = deps?.logger ?? console;
      logger.log(`[WeChat] Stopping account ${accountId}...`);
      // Implementation would stop WeChaty bot
      return { stopped: true };
    },
    loginWithQrStart: async ({ accountId, deps }) => {
      const logger = deps?.logger ?? console;
      logger.log(`[WeChat] Starting QR login for account ${accountId}...`);
      // Implementation would start QR code login process
      return { qrCode: "qr-code-data" };
    },
    loginWithQrWait: async ({ accountId, deps }) => {
      const logger = deps?.logger ?? console;
      logger.log(`[WeChat] Waiting for QR scan for account ${accountId}...`);
      // Implementation would wait for QR scan
      return { loggedIn: false, pending: true };
    },
    logoutAccount: async ({ accountId, deps }) => {
      const logger = deps?.logger ?? console;
      logger.log(`[WeChat] Logging out account ${accountId}...`);
      // Implementation would logout
      return { loggedOut: true };
    },
  },
};
