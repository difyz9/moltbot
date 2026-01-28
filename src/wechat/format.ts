/**
 * WeChat Message Formatting.
 */

import type { ChannelMessage } from "../channels/types.js";

/**
 * Format WeChat message for display.
 */
export function formatWeChatMessage(message: ChannelMessage): string {
  const parts: string[] = [];

  if (message.from) {
    parts.push(`[${message.from}]`);
  }

  if (message.text) {
    parts.push(message.text);
  }

  return parts.join(" ");
}

/**
 * Format WeChat target ID for CLI display.
 */
export function formatWeChatTarget(targetId: string): string {
  if (targetId.startsWith("wechat:")) {
    return targetId;
  }
  return `wechat:${targetId}`;
}

/**
 * Parse WeChat target from CLI input.
 */
export function parseWeChatTarget(input: string): string {
  const normalized = input.trim();
  if (normalized.startsWith("wechat:")) {
    return normalized.substring(7);
  }
  if (normalized.startsWith("wx:")) {
    return normalized.substring(3);
  }
  return normalized;
}

/**
 * Truncate text for WeChat messages.
 */
export function truncateWeChatText(text: string, maxLength = 2048): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format mentions for WeChat.
 */
export function formatWeChatMentions(mentionIds: string[]): string {
  if (mentionIds.length === 0) {
    return "";
  }

  // WeChat mentions are typically @userid
  return mentionIds.map((id) => `@${id}`).join(" ");
}
