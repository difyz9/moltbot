/**
 * WeChat Configuration Types.
 */

import type {
  BlockStreamingChunkConfig,
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
  MarkdownConfig,
  OutboundRetryConfig,
} from "./types.base.js";
import type { ChannelHeartbeatVisibilityConfig } from "./types.channels.js";
import type { DmConfig, ProviderCommandsConfig } from "./types.messages.js";
import type { GroupToolPolicyBySenderConfig, GroupToolPolicyConfig } from "./types.tools.js";

/**
 * WeChat network configuration.
 */
export type WeChatNetworkConfig = {
  /** Override Node's autoSelectFamily behavior (true = enable, false = disable). */
  autoSelectFamily?: boolean;
};

/**
 * WeChat capabilities configuration.
 */
export type WeChatCapabilitiesConfig =
  | string[]
  | {
      /** Placeholder for future capabilities */
      [key: string]: boolean | string[];
    };

/**
 * WeChat account configuration.
 */
export type WeChatAccountConfig = {
  /** Optional display name for this account (used in CLI/UI lists). */
  name?: string;
  /** Optional provider capability tags used for agent/runtime guidance. */
  capabilities?: WeChatCapabilitiesConfig;
  /** Markdown formatting overrides. */
  markdown?: MarkdownConfig;
  /** Override native command registration for WeChat (bool or "auto"). */
  commands?: ProviderCommandsConfig;
  /** Allow channel-initiated config writes (default: true). */
  configWrites?: boolean;
  /**
   * Controls how WeChat direct chats (DMs) are handled:
   * - "pairing" (default): unknown senders get a pairing code; owner must approve
   * - "allowlist": only allow senders in allowFrom (or paired allow store)
   * - "open": allow all inbound DMs (requires allowFrom to include "*")
   * - "disabled": ignore all inbound DMs
   */
  dmPolicy?: DmPolicy;
  /** If false, do not start this WeChat account. Default: true. */
  enabled?: boolean;
  /**
   * WeChaty puppet implementation to use.
   * Default: "wechaty-puppet-wechat"
   * Options: "wechaty-puppet-wechat", "wechaty-puppet-service", etc.
   */
  puppet?: string;
  /** Puppet-specific options passed to Wechaty constructor. */
  puppetOptions?: Record<string, unknown>;
  /**
   * Enable QR code login mode.
   * If true, WeChaty will display a QR code for scanning to login.
   * Default: true
   */
  qrCode?: boolean;
  /** Allow list for direct messages (user IDs or wildcards). */
  allowFrom?: string[];
  /**
   * Controls how group messages are handled:
   * - "open": groups bypass allowFrom, only mention-gating applies
   * - "disabled": block all group messages entirely
   * - "allowlist": only allow group messages from senders in groupAllowFrom/allowFrom
   */
  groupPolicy?: GroupPolicy;
  /** Optional allowlist for WeChat group senders. */
  groupAllowFrom?: string[];
  /** Per-group configuration. */
  groups?: Record<string, WeChatGroupConfig>;
  /** Max group messages to keep as history context (0 disables). */
  historyLimit?: number;
  /** Max DM turns to keep as history context. */
  dmHistoryLimit?: number;
  /** Per-DM config overrides keyed by user ID. */
  dms?: Record<string, DmConfig>;
  /** Outbound text chunk size (chars). Default: 2048. */
  textChunkLimit?: number;
  /** Chunking mode: "length" (default) splits by size; "newline" splits on every newline. */
  chunkMode?: "length" | "newline";
  /** Disable block streaming for this account. */
  blockStreaming?: boolean;
  /** Chunking config for draft streaming in `streamMode: "block"`. */
  draftChunk?: BlockStreamingChunkConfig;
  /** Merge streamed block replies before sending. */
  blockStreamingCoalesce?: BlockStreamingCoalesceConfig;
  /** Draft streaming mode for WeChat (off|partial|block). Default: partial. */
  streamMode?: "off" | "partial" | "block";
  /** Maximum media file size in MB. Default: 25. */
  mediaMaxMb?: number;
  /** API timeout in seconds. */
  timeoutSeconds?: number;
  /** Retry policy for outbound WeChat API calls. */
  retry?: OutboundRetryConfig;
  /** Network transport overrides for WeChat. */
  network?: WeChatNetworkConfig;
  /** Proxy URL for WeChat connections. */
  proxy?: string;
  /** Heartbeat visibility settings for this channel. */
  heartbeat?: ChannelHeartbeatVisibilityConfig;
};

/**
 * WeChat group configuration.
 */
export type WeChatGroupConfig = {
  requireMention?: boolean;
  /** Optional tool policy overrides for this group. */
  tools?: GroupToolPolicyConfig;
  toolsBySender?: GroupToolPolicyBySenderConfig;
  /** If specified, only load these skills for this group. Omit = all skills; empty = no skills. */
  skills?: string[];
  /** If false, disable the bot for this group. */
  enabled?: boolean;
  /** Optional allowlist for group senders. */
  allowFrom?: string[];
  /** Optional system prompt snippet for this group. */
  systemPrompt?: string;
};

/**
 * WeChat configuration (root-level + accounts).
 */
export type WeChatConfig = {
  /** Optional per-account WeChat configuration (multi-account). */
  accounts?: Record<string, WeChatAccountConfig>;
  /** Default account ID to use when no specific account is specified. */
  defaultAccountId?: string;
} & WeChatAccountConfig;
