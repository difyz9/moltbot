/**
 * WeChat Work Bot Message Handlers.
 */

import type { ChannelMessage } from "../channels/types.js";
import type { ResolvedWeComAccount } from "./accounts.js";

/**
 * WeCom webhook message payload.
 */
export interface WeComWebhookMessage {
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  MsgId?: string;
  AgentID?: number;
  Content?: string;
  MediaId?: string;
  PicUrl?: string;
  Format?: string;
  ThumbMediaId?: string;
  Location_X?: string;
  Location_Y?: string;
  Scale?: number;
  Label?: string;
  Title?: string;
  Description?: string;
  Url?: string;
  Event?: string;
  EventKey?: string;
  Ticket?: string;
  Status?: string;
}

/**
 * WeCom event types.
 */
export type WeComEventType =
  | "subscribe"
  | "unsubscribe"
  | "LOCATION"
  | "CLICK"
  | "VIEW"
  | "SCAN"
  | "ENTER_AGENT"
  | "LOCATION"
  | "view_limited"
  | "enter_session";

/**
 * Message handler function type.
 */
export type WeComMessageHandler = (
  message: WeComWebhookMessage,
  account: ResolvedWeComAccount,
) => Promise<void> | void;

/**
 * Registered message handlers.
 */
const messageHandlers: WeComMessageHandler[] = [];

/**
 * Register a message handler.
 */
export function registerWeComMessageHandler(handler: WeComMessageHandler): void {
  messageHandlers.push(handler);
}

/**
 * Convert WeCom message to channel message format.
 */
export function weComMessageToChannelMessage(
  message: WeComWebhookMessage,
  account: ResolvedWeComAccount,
): ChannelMessage {
  return {
    id: message.MsgId || String(message.CreateTime),
    channelId: "wecom",
    accountId: account.id,
    from: message.FromUserName,
    to: message.ToUserName,
    text: message.Content,
    timestamp: message.CreateTime * 1000,
    replyToId: undefined,
    threadId: undefined,
    metadata: {
      msgType: message.MsgType,
      mediaId: message.MediaId,
      picUrl: message.PicUrl,
      event: message.Event,
      eventKey: message.EventKey,
    },
  };
}

/**
 * Check if message is a user message.
 */
export function isUserMessage(message: WeComWebhookMessage): boolean {
  return !!(
    message.MsgType &&
    ["text", "image", "voice", "video", "file", "location", "link"].includes(message.MsgType)
  );
}

/**
 * Check if message is an event.
 */
export function isEventMessage(message: WeComWebhookMessage): boolean {
  return !!message.Event;
}

/**
 * Check if message is a subscribe event.
 */
export function isSubscribeEvent(message: WeComWebhookMessage): boolean {
  return message.Event === "subscribe";
}

/**
 * Check if message is an unsubscribe event.
 */
export function isUnsubscribeEvent(message: WeComWebhookMessage): boolean {
  return message.Event === "unsubscribe";
}

/**
 * Check if message is a location message.
 */
export function isLocationMessage(message: WeComWebhookMessage): boolean {
  return message.MsgType === "location";
}

/**
 * Extract text content from message.
 */
export function extractTextContent(message: WeComWebhookMessage): string {
  return message.Content || "";
}
