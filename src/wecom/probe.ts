/**
 * WeChat Work Connection Probing.
 */

import type { ResolvedWeComAccount } from "./accounts.js";
import { getWeComBot } from "./bot.js";

/**
 * Probe result for WeCom connection.
 */
export interface WeComProbeResult {
  connected: boolean;
  hasAccessToken: boolean;
  latency: number;
  error?: string;
}

/**
 * Probe WeCom bot connection.
 */
export async function probeWeComConnection(
  account: ResolvedWeComAccount,
  timeoutMs = 5000,
): Promise<WeComProbeResult> {
  const startTime = Date.now();

  try {
    const bot = getWeComBot(account);

    // Try to get access token
    const accessToken = await bot.getAccessToken();

    return {
      connected: true,
      hasAccessToken: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      hasAccessToken: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Quick probe (check only if bot instance exists).
 */
export function quickProbeWeCom(accountId: string): boolean {
  try {
    const account = { id: accountId } as ResolvedWeComAccount;
    getWeComBot(account);
    return true;
  } catch {
    return false;
  }
}
