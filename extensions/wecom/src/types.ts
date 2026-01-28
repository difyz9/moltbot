/**
 * WeChat Work (WeCom) types.
 */

/**
 * WeChat Work account configuration.
 */
export type WeComAccountConfig = {
  /** Optional display name for this account. */
  name?: string;
  /** If false, do not start this WeCom account. */
  enabled?: boolean;
  /**
   * WeChat Work Corp ID (企业ID).
   */
  corpId?: string;
  /**
   * WeChat Work Agent ID (应用ID).
   */
  agentId?: string | number;
  /**
   * WeChat Work Agent Secret (应用Secret).
   */
  secret?: string;
  /** Path to file containing agent secret. */
  secretFile?: string;
  /**
   * WeChat Work API access token.
   */
  accessToken?: string;
  /** Path to file containing access token. */
  accessTokenFile?: string;
  /**
   * API type to use: "webhook" or "callback".
   */
  apiType?: "webhook" | "callback";
  /** Webhook URL for receiving messages. */
  webhookUrl?: string;
  /** Webhook token for signature verification. */
  webhookToken?: string;
  /** Encoding AES key for message encryption. */
  encodingAESKey?: string;
  /** Callback URL for receiving messages. */
  callbackUrl?: string;
  /**
   * Verify SSL/TLS certificates for API requests.
   */
  verifySsl?: boolean;
  /**
   * API request timeout in seconds.
   */
  timeoutSeconds?: number;
  /** Allow list for direct messages. */
  allowFrom?: string[];
  /**
   * Controls how group messages are handled.
   */
  groupPolicy?: "open" | "disabled" | "allowlist";
  /** Optional allowlist for WeCom group senders. */
  groupAllowFrom?: string[];
  /** Per-group configuration. */
  groups?: Record<string, WeComGroupConfig>;
  /** Max group messages to keep as history context. */
  historyLimit?: number;
  /** Max DM turns to keep as history context. */
  dmHistoryLimit?: number;
  /** DM policy. */
  dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
  /** Outbound text chunk size (chars). */
  textChunkLimit?: number;
  /** Chunking mode. */
  chunkMode?: "length" | "newline";
  /** Disable block streaming for this account. */
  blockStreaming?: boolean;
  /** Maximum media file size in MB. */
  mediaMaxMb?: number;
  /** Proxy URL for WeCom API connections. */
  proxy?: string;
};

/**
 * WeChat Work group configuration.
 */
export type WeComGroupConfig = {
  requireMention?: boolean;
  /** If false, disable the bot for this group. */
  enabled?: boolean;
  /** Optional allowlist for group senders. */
  allowFrom?: string[];
  /** WeCom department ID. */
  departmentId?: string;
  /** WeCom chat ID. */
  chatId?: string;
};

/**
 * Resolved WeChat Work account.
 */
export type ResolvedWeComAccount = {
  id: string;
  enabled: boolean;
  name: string;
  corpId: string;
  agentId: string;
  secret: string;
  accessToken: string;
  apiType: "webhook" | "callback";
  webhookUrl?: string;
  webhookToken?: string;
  encodingAESKey?: string;
  callbackUrl?: string;
  verifySsl: boolean;
  timeoutSeconds: number;
  proxy?: string;
  dmPolicy: "pairing" | "allowlist" | "open" | "disabled";
  groupPolicy: "open" | "disabled" | "allowlist";
  allowFrom: string[];
  groupAllowFrom: string[];
  groups: Record<string, WeComGroupConfig>;
  historyLimit: number;
  dmHistoryLimit: number;
  textChunkLimit: number;
  chunkMode: "length" | "newline";
  blockStreaming: boolean;
  mediaMaxMb: number;
};

/**
 * WeChat Work target ID.
 */
export type WeComTargetId = string;

/**
 * WeChat Work group ID.
 */
export type WeComGroupId = string;

/**
 * WeChat Work department ID.
 */
export type WeComDepartmentId = string;

/**
 * WeChat Work tag ID.
 */
export type WeComTagId = string;
