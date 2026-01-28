/**
 * WeChat Work Bot Monitoring.
 */

import type { ResolvedWeComAccount } from "./accounts.js";

/**
 * Monitor metrics for WeCom bots.
 */
interface WeComMonitorMetrics {
  accountId: string;
  connected: boolean;
  messagesReceived: number;
  messagesSent: number;
  lastMessageTime?: Date;
  lastError?: Error;
  webhookActive?: boolean;
}

/**
 * Monitor registry.
 */
const monitorRegistry = new Map<string, WeComMonitorMetrics>();

/**
 * Get monitor metrics for an account.
 */
export function getWeComMonitorMetrics(accountId: string): WeComMonitorMetrics | undefined {
  return monitorRegistry.get(accountId);
}

/**
 * Initialize monitor for an account.
 */
export function initWeComMonitor(account: ResolvedWeComAccount): void {
  monitorRegistry.set(account.id, {
    accountId: account.id,
    connected: false,
    messagesReceived: 0,
    messagesSent: 0,
    webhookActive: false,
  });
}

/**
 * Update connection status.
 */
export function updateWeComConnectionStatus(accountId: string, connected: boolean): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.connected = connected;
  }
}

/**
 * Update webhook status.
 */
export function updateWeComWebhookStatus(accountId: string, active: boolean): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.webhookActive = active;
  }
}

/**
 * Increment message received count.
 */
export function incrementWeComMessagesReceived(accountId: string): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.messagesReceived++;
    metrics.lastMessageTime = new Date();
  }
}

/**
 * Increment message sent count.
 */
export function incrementWeComMessagesSent(accountId: string): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.messagesSent++;
  }
}

/**
 * Record error.
 */
export function recordWeComError(accountId: string, error: Error): void {
  const metrics = monitorRegistry.get(accountId);
  if (metrics) {
    metrics.connected = false;
    metrics.lastError = error;
  }
}

/**
 * Get all monitor metrics.
 */
export function getAllWeComMonitorMetrics(): WeComMonitorMetrics[] {
  return Array.from(monitorRegistry.values());
}

/**
 * Remove monitor for an account.
 */
export function removeWeComMonitor(accountId: string): void {
  monitorRegistry.delete(accountId);
}
