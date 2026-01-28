/**
 * WeChat Work Message Sending.
 */

import type { ResolvedWeComAccount } from "./accounts.js";
import { getWeComBot } from "./bot.js";
import type { WeComMessageSendRequest, WeComMessageType } from "./api.js";

/**
 * Send text message to WeCom target.
 */
export async function sendWeComText(
  account: ResolvedWeComAccount,
  targetId: string,
  text: string,
  targetType: "user" | "department" | "tag" = "user",
): Promise<{ errcode: number; errmsg: string }> {
  const bot = getWeComBot(account);

  const request: WeComMessageSendRequest = {
    agentid: account.agentId,
    msgtype: "text",
    text: { content: text },
  };

  // Set target based on type
  if (targetType === "user") {
    request.touser = targetId;
  } else if (targetType === "department") {
    request.toparty = targetId;
  } else if (targetType === "tag") {
    request.totag = targetId;
  }

  return await bot.sendMessage(request);
}

/**
 * Send media message to WeCom target.
 */
export async function sendWeComMedia(
  account: ResolvedWeComAccount,
  targetId: string,
  mediaType: WeComMessageType,
  mediaId: string,
  targetType: "user" | "department" | "tag" = "user",
): Promise<{ errcode: number; errmsg: string }> {
  const bot = getWeComBot(account);

  const request: WeComMessageSendRequest = {
    agentid: account.agentId,
    msgtype: mediaType,
  };

  // Set target based on type
  if (targetType === "user") {
    request.touser = targetId;
  } else if (targetType === "department") {
    request.toparty = targetId;
  } else if (targetType === "tag") {
    request.totag = targetId;
  }

  // Set media based on type
  if (mediaType === "image") {
    request.image = { media_id: mediaId };
  } else if (mediaType === "voice") {
    request.voice = { media_id: mediaId };
  } else if (mediaType === "video") {
    request.video = { media_id: mediaId };
  } else if (mediaType === "file") {
    request.file = { media_id: mediaId };
  }

  return await bot.sendMessage(request);
}

/**
 * Send markdown message to WeCom target.
 */
export async function sendWeComMarkdown(
  account: ResolvedWeComAccount,
  targetId: string,
  markdown: string,
  targetType: "user" | "department" | "tag" = "user",
): Promise<{ errcode: number; errmsg: string }> {
  const bot = getWeComBot(account);

  const request: WeComMessageSendRequest = {
    agentid: account.agentId,
    msgtype: "markdown",
    markdown: { content: markdown },
  };

  // Set target based on type
  if (targetType === "user") {
    request.touser = targetId;
  } else if (targetType === "department") {
    request.toparty = targetId;
  } else if (targetType === "tag") {
    request.totag = targetId;
  }

  return await bot.sendMessage(request);
}

/**
 * Send text card message to WeCom target.
 */
export async function sendWeComTextCard(
  account: ResolvedWeComAccount,
  targetId: string,
  title: string,
  description: string,
  url: string,
  btnText?: string,
  targetType: "user" | "department" | "tag" = "user",
): Promise<{ errcode: number; errmsg: string }> {
  const bot = getWeComBot(account);

  const request: WeComMessageSendRequest = {
    agentid: account.agentId,
    msgtype: "textcard",
    textcard: {
      title,
      description,
      url,
      btntxt: btnText,
    },
  };

  // Set target based on type
  if (targetType === "user") {
    request.touser = targetId;
  } else if (targetType === "department") {
    request.toparty = targetId;
  } else if (targetType === "tag") {
    request.totag = targetId;
  }

  return await bot.sendMessage(request);
}

/**
 * Upload media to WeCom.
 */
export async function uploadWeComMedia(
  account: ResolvedWeComAccount,
  type: "image" | "voice" | "video" | "file",
  filePath: string,
): Promise<{ media_id: string; created_at: string }> {
  const bot = getWeComBot(account);

  const response = await bot.uploadMedia(type, filePath);

  return {
    media_id: response.media_id,
    created_at: response.created_at,
  };
}
