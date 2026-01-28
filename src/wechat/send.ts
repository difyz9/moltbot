/**
 * WeChat Message Sending.
 */

import type { Wechaty, Contact, Room } from "wechaty";
import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";
import { getWeChatBot } from "./bot.js";
import { FileBox } from "file-box";

/**
 * Send text message to WeChat target.
 */
export async function sendWeChatText(
  account: ResolvedWeChatAccount,
  targetId: string,
  text: string,
): Promise<string> {
  const bot = getWeChatBot(account);

  const room = await bot.Room.find({ id: targetId });
  if (room) {
    await room.say(text);
    return `wechat-${Date.now()}`;
  }

  const contact = await bot.Contact.find({ id: targetId });
  if (contact) {
    await contact.say(text);
    return `wechat-${Date.now()}`;
  }

  throw new Error(`WeChat target not found: ${targetId}`);
}

/**
 * Send media message to WeChat target.
 */
export async function sendWeChatMedia(
  account: ResolvedWeChatAccount,
  targetId: string,
  mediaUrl: string,
  text?: string,
): Promise<string> {
  const bot = getWeChatBot(account);

  const fileBox = FileBox.fromUrl(mediaUrl);

  const room = await bot.Room.find({ id: targetId });
  if (room) {
    await room.say(fileBox);
    if (text) {
      await room.say(text);
    }
    return `wechat-${Date.now()}`;
  }

  const contact = await bot.Contact.find({ id: targetId });
  if (contact) {
    await contact.say(fileBox);
    if (text) {
      await contact.say(text);
    }
    return `wechat-${Date.now()}`;
  }

  throw new Error(`WeChat target not found: ${targetId}`);
}

/**
 * Send file message to WeChat target.
 */
export async function sendWeChatFile(
  account: ResolvedWeChatAccount,
  targetId: string,
  filePath: string,
): Promise<string> {
  const bot = getWeChatBot(account);

  const fileBox = FileBox.fromFile(filePath);

  const room = await bot.Room.find({ id: targetId });
  if (room) {
    await room.say(fileBox);
    return `wechat-${Date.now()}`;
  }

  const contact = await bot.Contact.find({ id: targetId });
  if (contact) {
    await contact.say(fileBox);
    return `wechat-${Date.now()}`;
  }

  throw new Error(`WeChat target not found: ${targetId}`);
}
