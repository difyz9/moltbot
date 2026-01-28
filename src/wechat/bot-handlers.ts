/**
 * WeChat Bot Message Handlers.
 */

import type { Wechaty, Message } from "wechaty";
import type { ChannelMessage } from "../channels/types.js";
import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";

/**
 * Message handler function type.
 */
export type WeChatMessageHandler = (
  message: Message,
  bot: Wechaty,
  account: ResolvedWeChatAccount,
) => Promise<void> | void;

/**
 * Registered message handlers.
 */
const messageHandlers: WeChatMessageHandler[] = [];

/**
 * Register a message handler.
 */
export function registerWeChatMessageHandler(handler: WeChatMessageHandler): void {
  messageHandlers.push(handler);
}

/**
 * Convert WeChat message to channel message format.
 */
export function weChatMessageToChannelMessage(
  message: Message,
  bot: Wechaty,
  account: ResolvedWeChatAccount,
): ChannelMessage {
  const talker = message.talker();
  const room = message.room();
  const text = message.text();

  return {
    id: message.id,
    channelId: "wechat",
    accountId: account.id,
    from: talker.id,
    to: bot.currentUser?.id,
    text: text,
    timestamp: message.date()?.getTime() ?? Date.now(),
    replyToId: undefined,
    threadId: undefined,
    metadata: {
      room: room?.id,
      mentions: message.mentionList().map((c) => c.id),
      messageType: message.type(),
    },
  };
}

/**
 * Set up bot message handlers.
 */
export function setupWeChatBotHandlers(bot: Wechaty, account: ResolvedWeChatAccount): void {
  bot.on("message", async (message) => {
    for (const handler of messageHandlers) {
      try {
        await handler(message, bot, account);
      } catch (error) {
        console.error("[WeChat] Handler error:", error);
      }
    }
  });

  bot.on("scan", (qrcode, status) => {
    console.log(`[WeChat] QR Code status: ${status}`);
    if (status === 2 || status === 3) {
      const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      console.log(`[WeChat] Scan QR Code at: ${url}`);
    }
  });

  bot.on("login", (user) => {
    console.log(`[WeChat] Logged in as ${user.name()}`);
  });

  bot.on("logout", (user) => {
    console.log(`[WeChat] Logged out: ${user.name()}`);
  });

  bot.on("error", (error) => {
    console.error("[WeChat] Bot error:", error);
  });
}
