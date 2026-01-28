/**
 * WeChat Bot Monitoring.
 */

import type { Wechaty } from "wechaty";
import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";
import { getWeChatBot } from "./bot.js";

/**
 * Monitor metrics for WeChat bots.
 */
interface WeChatMonitorMetrics {
  accountId: string;
  connected: boolean;
  messagesReceived: number;
  messagesSent: number;
  lastMessageTime?: Date;
  lastError?: Error;
}

/**
 * Monitor registry.
 */
const monitorRegistry = new Map<string, WeChatMonitorMetrics>();

/**
 * Get monitor metrics for an account.
 */
export function getWeChatMonitorMetrics(accountId: string): WeChatMonitorMetrics | undefined {
  return monitorRegistry.get(accountId);
}

/**
 * Initialize monitor for an account.
 */
export function initWeChatMonitor(account: ResolvedWeChatAccount): void {
  monitorRegistry.set(account.id, {
    accountId: account.id,
    connected: false,
    messagesReceived: 0,
    messagesSent: 0,
  });
}

/**
 * Update connection status.
 */
export function updateWeChatConnectionStatus(accountId: string, connected: boolean): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.connected = connected;
  }
}

/**
 * Increment message received count.
 */
export function incrementWeChatMessagesReceived(accountId: string): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.messagesReceived++;
    metrics.lastMessageTime = new Date();
  }
}

/**
 * Increment message sent count.
 */
export function incrementWeChatMessagesSent(accountId: string): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.messagesSent++;
  }
}

/**
 * Record error.
 */
export function recordWeChatError(accountId: string, error: Error): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.connected = false;
    metrics.lastError = error;
  }
}

/**
 * Get all monitor metrics.
 */
export function getAllWeChatMonitorMetrics(): WeChatMonitorMetrics[] {
  return Array.from(monitorRegistry.values());
}

/**
 * Remove monitor for an account.
 */
export function removeWeChatMonitor(accountId: string): void {
  monitorRegistry.delete(accountId);
}
