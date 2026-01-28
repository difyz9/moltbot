/**
 * WeChat Work (WeCom) Configuration Types.
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
 * WeChat Work API type.
 */
export type WeComApiType = "webhook" | "callback";

/**
 * WeChat Work message types.
 */
export type WeComMessageType =
  | "text"
  | "image"
  | "voice"
  | "video"
  | "file"
  | "textcard"
  | "news"
  | "mpnews"
  | "markdown"
  | "miniprogram";

/**
 * WeChat Work account configuration.
 */
export type WeComAccountConfig = {
  /** Optional display name for this account (used in CLI/UI lists). */
  name?: string;
  /** Optional provider capability tags used for agent/runtime guidance. */
  capabilities?: string[];
  /** Markdown formatting overrides. */
  markdown?: MarkdownConfig;
  /** Override native command registration for WeCom (bool or "auto"). */
  commands?: ProviderCommandsConfig;
  /** Allow channel-initiated config writes (default: true). */
  configWrites?: boolean;
  /**
   * Controls how WeCom direct chats (DMs) are handled:
   * - "pairing" (default): unknown senders get a pairing code; owner must approve
   * - "allowlist": only allow senders in allowFrom (or paired allow store)
   * - "open": allow all inbound DMs (requires allowFrom to include "*")
   * - "disabled": ignore all inbound DMs
   */
  dmPolicy?: DmPolicy;
  /** If false, do not start this WeCom account. Default: true. */
  enabled?: boolean;
  /**
   * WeChat Work Corp ID (企业ID).
   * Get from https://work.weixin.qq.com -> My Enterprise -> Enterprise Info.
   */
  corpId?: string;
  /**
   * WeChat Work Agent ID (应用ID).
   * Get from https://work.weixin.qq.com -> Application Management -> Application.
   */
  agentId?: string | number;
  /**
   * WeChat Work Agent Secret (应用Secret).
   * Get from https://work.weixin.qq.com -> Application Management -> Application -> Secret.
   */
  secret?: string;
  /** Path to file containing agent secret (for secret managers like agenix). */
  secretFile?: string;
  /**
   * WeChat Work API access token.
   * Can be provided directly or loaded from corpId + secret.
   */
  accessToken?: string;
  /** Path to file containing access token (for secret managers like agenix). */
  accessTokenFile?: string;
  /**
   * API type to use.
   * - "webhook": Use webhook for receiving messages (recommended for production)
   * - "callback": Use callback URL for receiving messages
   * Default: "webhook"
   */
  apiType?: WeComApiType;
  /** Webhook URL for receiving messages (if apiType is "webhook"). */
  webhookUrl?: string;
  /** Webhook token for signature verification (if apiType is "webhook"). */
  webhookToken?: string;
  /** Encoding AES key for message encryption (if apiType is "webhook"). */
  encodingAESKey?: string;
  /** Callback URL for receiving messages (if apiType is "callback"). */
  callbackUrl?: string;
  /**
   * Verify SSL/TLS certificates for API requests.
   * Default: true
   */
  verifySsl?: boolean;
  /**
   * API request timeout in seconds.
   * Default: 30
   */
  timeoutSeconds?: number;
  /** Allow list for direct messages (user IDs or wildcards). */
  allowFrom?: string[];
  /**
   * Controls how group messages are handled:
   * - "open": groups bypass allowFrom, only mention-gating applies
   * - "disabled": block all group messages entirely
   * - "allowlist": only allow group messages from senders in groupAllowFrom/allowFrom
   */
  groupPolicy?: GroupPolicy;
  /** Optional allowlist for WeCom group senders. */
  groupAllowFrom?: string[];
  /** Per-group configuration. */
  groups?: Record<string, WeComGroupConfig>;
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
  /** Draft streaming mode for WeCom (off|partial|block). Default: partial. */
  streamMode?: "off" | "partial" | "block";
  /** Maximum media file size in MB. Default: 20. */
  mediaMaxMb?: number;
  /** Retry policy for outbound WeCom API calls. */
  retry?: OutboundRetryConfig;
  /** Proxy URL for WeCom API connections. */
  proxy?: string;
  /** Heartbeat visibility settings for this channel. */
  heartbeat?: ChannelHeartbeatVisibilityConfig;
};

/**
 * WeChat Work group configuration.
 */
export type WeComGroupConfig = {
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
  /** WeCom department ID (if using department-based routing). */
  departmentId?: string;
  /** WeCom chat ID (for group chat). */
  chatId?: string;
};

/**
 * WeChat Work configuration (root-level + accounts).
 */
export type WeComConfig = {
  /** Optional per-account WeCom configuration (multi-account). */
  accounts?: Record<string, WeComAccountConfig>;
  /** Default account ID to use when no specific account is specified. */
  defaultAccountId?: string;
} & WeComAccountConfig;
