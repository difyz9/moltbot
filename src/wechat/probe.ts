/**
 * WeChat Connection Probing.
 */

import type { Wechaty } from "wechaty";
import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";
import { getWeChatBot } from "./bot.js";

/**
 * Probe result for WeChat connection.
 */
export interface WeChatProbeResult {
  connected: boolean;
  loggedIn: boolean;
  latency: number;
  error?: string;
}

/**
 * Probe WeChat bot connection.
 */
export async function probeWeChatConnection(
  account: ResolvedWeChatAccount,
  timeoutMs = 5000,
): Promise<WeChatProbeResult> {
  const startTime = Date.now();

  try {
    const bot = getWeChatBot(account);

    if (!bot.isLoggedIn) {
      return {
        connected: bot.status === Wechaty.Ready,
        loggedIn: false,
        latency: Date.now() - startTime,
        error: "Not logged in",
      };
    }

    // Try to get current user as a ping
    const user = bot.currentUser;
    if (!user) {
      return {
        connected: false,
        loggedIn: false,
        latency: Date.now() - startTime,
        error: "No current user",
      };
    }

    return {
      connected: true,
      loggedIn: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      loggedIn: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Quick probe (check only if bot instance exists and is ready).
 */
export function quickProbeWeChat(accountId: string): boolean {
  try {
    const bot = getWeChatBot({ id: accountId } as ResolvedWeChatAccount);
    return bot.isLoggedIn;
  } catch {
    return false;
  }
}
