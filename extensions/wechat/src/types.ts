/**
 * Type definitions for WeChat channel plugin.
 */

import type { FileBox } from "file-box";

/**
 * WeChat account configuration.
 */
export interface WeChatAccountConfig {
  enabled?: boolean;
  name?: string;
  puppet?: string;
  puppetOptions?: Record<string, unknown>;
  qrCode?: boolean;
}

/**
 * Resolved WeChat account configuration.
 */
export interface ResolvedWeChatAccount {
  id: string;
  enabled: boolean;
  name: string;
  puppet: string;
  puppetOptions?: Record<string, unknown>;
  qrCode: boolean;
}

/**
 * WeChat message payload.
 */
export interface WeChatMessagePayload {
  from?: string;
  to?: string;
  room?: string;
  text?: string;
  mention?: string[];
  type?: string;
  id?: string;
  timestamp?: number;
}

/**
 * WeChat target identifier.
 */
export type WeChatTargetId = string;

/**
 * WeChat group identifier.
 */
export type WeChatGroupId = string;

/**
 * WeChat user identifier.
 */
export type WeChatUserId = string;

/**
 * WeChat message options.
 */
export interface WeChatMessageOptions {
  replyToId?: string;
  threadId?: string;
  mentionList?: string[];
}
