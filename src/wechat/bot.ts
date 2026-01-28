/**
 * WeChat Bot Management.
 */

import { Wechaty, WechatyBuilder } from "wechaty";
import { PuppetOptions } from "wechaty-puppet";
import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";

/**
 * WeChat bot instance registry.
 */
const botRegistry = new Map<string, Wechaty>();

/**
 * Get or create WeChat bot instance for an account.
 */
export function getWeChatBot(account: ResolvedWeChatAccount): Wechaty {
  let bot = botRegistry.get(account.id);
  if (!bot) {
    const options: PuppetOptions = {
      name: `moltbot-wechat-${account.id}`,
    };

    if (account.puppetOptions) {
      Object.assign(options, account.puppetOptions);
    }

    bot = WechatyBuilder.build({
      puppet: account.puppet,
      puppetOptions: options,
    });

    botRegistry.set(account.id, bot);
  }

  return bot;
}

/**
 * Remove WeChat bot instance from registry.
 */
export function removeWeChatBot(accountId: string): void {
  const bot = botRegistry.get(accountId);
  if (bot) {
    botRegistry.delete(accountId);
  }
}

/**
 * Check if WeChat bot instance exists.
 */
export function hasWeChatBot(accountId: string): boolean {
  return botRegistry.has(accountId);
}

/**
 * Start WeChat bot.
 */
export async function startWeChatBot(account: ResolvedWeChatAccount): Promise<void> {
  const bot = getWeChatBot(account);

  if (bot.isLoggedIn) {
    return;
  }

  await bot.start();
}

/**
 * Stop WeChat bot.
 */
export async function stopWeChatBot(accountId: string): Promise<void> {
  const bot = botRegistry.get(accountId);
  if (!bot) {
    return;
  }

  if (bot.isLoggedIn) {
    await bot.stop();
  }

  removeWeChatBot(accountId);
}
