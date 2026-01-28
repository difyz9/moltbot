/**
 * WeChat Work Message Formatting.
 */

import type { ChannelMessage } from "../channels/types.js";

/**
 * Format WeCom message for display.
 */
export function formatWeComMessage(message: ChannelMessage): string {
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
 * Format WeCom target ID for CLI display.
 */
export function formatWeComTarget(targetId: string, targetType?: string): string {
  return `wecom:${targetType || "user"}:${targetId}`;
}

/**
 * Parse WeCom target from CLI input.
 */
export function parseWeComTarget(input: string): { targetId: string; targetType: string } {
  const normalized = input.trim();
  if (normalized.startsWith("wecom:")) {
    const parts = normalized.split(":");
    if (parts.length >= 3) {
      return { targetId: parts.slice(2).join(":"), targetType: parts[1] };
    }
    if (parts.length === 2) {
      return { targetId: parts[1], targetType: "user" };
    }
  }
  return { targetId: normalized, targetType: "user" };
}

/**
 * Truncate text for WeCom messages.
 */
export function truncateWeComText(text: string, maxLength = 2048): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format markdown for WeCom.
 */
export function formatWeComMarkdown(markdown: string): string {
  // WeCom markdown format may need adjustments
  return markdown;
}

/**
 * Format text card for WeCom.
 */
export function formatWeComTextCard(
  title: string,
  description: string,
  url: string,
  btnText?: string,
): string {
  const lines: string[] = [];
  lines.push(`**${title}**`);
  lines.push(description);
  lines.push(`[Read more](${url})`);
  return lines.join("\n");
}
