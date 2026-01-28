/**
 * WeChat Target Resolution.
 */

import type { Wechaty } from "wechaty";
import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";
import { getWeChatBot } from "./bot.js";

/**
 * WeChat target type.
 */
export type WeChatTargetType = "contact" | "room";

/**
 * Resolved WeChat target.
 */
export interface ResolvedWeChatTarget {
  id: string;
  type: WeChatTargetType;
  name?: string;
}

/**
 * Resolve WeChat target by ID.
 */
export async function resolveWeChatTarget(
  account: ResolvedWeChatAccount,
  targetId: string,
): Promise<ResolvedWeChatTarget | null> {
  const bot = getWeChatBot(account);

  // Try to find as room first
  const room = await bot.Room.find({ id: targetId });
  if (room) {
    return {
      id: targetId,
      type: "room",
      name: await room.topic(),
    };
  }

  // Try to find as contact
  const contact = await bot.Contact.find({ id: targetId });
  if (contact) {
    return {
      id: targetId,
      type: "contact",
      name: contact.name(),
    };
  }

  return null;
}

/**
 * Search WeChat targets by name.
 */
export async function searchWeChatTargets(
  account: ResolvedWeChatAccount,
  query: string,
): Promise<ResolvedWeChatTarget[]> {
  const bot = getWeChatBot(account);
  const results: ResolvedWeChatTarget[] = [];

  // Search rooms
  const rooms = await bot.Room.findAll();
  for (const room of rooms) {
    const topic = await room.topic();
    if (topic.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: room.id,
        type: "room",
        name: topic,
      });
    }
  }

  // Search contacts
  const contacts = await bot.Contact.findAll();
  for (const contact of contacts) {
    const name = contact.name();
    if (name.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: contact.id,
        type: "contact",
        name: name,
      });
    }
  }

  return results;
}

/**
 * Get all WeChat targets for an account.
 */
export async function getAllWeChatTargets(
  account: ResolvedWeChatAccount,
): Promise<ResolvedWeChatTarget[]> {
  const bot = getWeChatBot(account);
  const results: ResolvedWeChatTarget[] = [];

  // Get all rooms
  const rooms = await bot.Room.findAll();
  for (const room of rooms) {
    results.push({
      id: room.id,
      type: "room",
      name: await room.topic(),
    });
  }

  // Get all contacts
  const contacts = await bot.Contact.findAll();
  for (const contact of contacts) {
    results.push({
      id: contact.id,
      type: "contact",
      name: contact.name(),
    });
  }

  return results;
}
