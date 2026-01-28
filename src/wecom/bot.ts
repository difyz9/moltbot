/**
 * WeChat Work Bot Management.
 */

import type { ResolvedWeComAccount } from "./accounts.js";
import { WeComApiClient, type WeComApiConfig } from "./api.js";

/**
 * WeChat Work bot instance registry.
 */
const botRegistry = new Map<string, WeComApiClient>();

/**
 * Get or create WeCom bot instance for an account.
 */
export function getWeComBot(account: ResolvedWeComAccount): WeComApiClient {
  let bot = botRegistry.get(account.id);
  if (!bot) {
    const config: WeComApiConfig = {
      corpId: account.corpId,
      agentId: account.agentId,
      secret: account.secret,
      accessToken: account.accessToken,
      webhookUrl: account.webhookUrl,
      webhookToken: account.webhookToken,
      encodingAESKey: account.encodingAESKey,
      verifySsl: account.verifySsl,
      timeoutSeconds: account.timeoutSeconds,
      proxy: account.proxy,
    };

    bot = new WeComApiClient(config);
    botRegistry.set(account.id, bot);
  }

  return bot;
}

/**
 * Remove WeCom bot instance from registry.
 */
export function removeWeComBot(accountId: string): void {
  const bot = botRegistry.get(accountId);
  if (bot) {
    botRegistry.delete(accountId);
  }
}

/**
 * Check if WeCom bot instance exists.
 */
export function hasWeComBot(accountId: string): boolean {
  return botRegistry.has(accountId);
}

/**
 * Start WeCom bot.
 */
export async function startWeComBot(account: ResolvedWeComAccount): Promise<void> {
  const bot = getWeComBot(account);

  // Test connection by getting access token
  await bot.getAccessToken();
}

/**
 * Stop WeCom bot.
 */
export function stopWeComBot(accountId: string): void {
  removeWeComBot(accountId);
}
