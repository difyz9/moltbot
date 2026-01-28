/**
 * WeChat Work Bot Handlers Tests
 */

import { describe, it, expect } from "vitest";
import {
  weComMessageToChannelMessage,
  isUserMessage,
  isEventMessage,
  isSubscribeEvent,
  isUnsubscribeEvent,
  isLocationMessage,
  extractTextContent,
} from "../bot-handlers.js";
import type { ResolvedWeComAccount } from "../accounts.js";
import type { WeComWebhookMessage } from "../bot-handlers.js";

describe("WeCom Bot Handlers", () => {
  const testAccount: ResolvedWeComAccount = {
    id: "test-account",
    enabled: true,
    name: "Test",
    corpId: "ww1234567890abcdef",
    agentId: 1000001,
    apiType: "webhook",
    verifySsl: true,
    timeoutSeconds: 30,
  };

  describe("weComMessageToChannelMessage", () => {
    it("should convert text message to channel message", () => {
      const wecomMsg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "text",
        MsgId: "msg-123",
        Content: "Hello!",
      };

      const channelMsg = weComMessageToChannelMessage(wecomMsg, testAccount);
      expect(channelMsg.id).toBe("msg-123");
      expect(channelMsg.channelId).toBe("wecom");
      expect(channelMsg.accountId).toBe("test-account");
      expect(channelMsg.from).toBe("user123");
      expect(channelMsg.to).toBe("bot");
      expect(channelMsg.text).toBe("Hello!");
      expect(channelMsg.metadata?.msgType).toBe("text");
    });

    it("should convert event message to channel message", () => {
      const wecomMsg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user456",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "subscribe",
      };

      const channelMsg = weComMessageToChannelMessage(wecomMsg, testAccount);
      expect(channelMsg.metadata?.event).toBe("subscribe");
    });
  });

  describe("isUserMessage", () => {
    it("should return true for text message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "text",
        Content: "Hello",
      };
      expect(isUserMessage(msg)).toBe(true);
    });

    it("should return true for image message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "image",
        MediaId: "media-123",
        PicUrl: "https://example.com/image.jpg",
      };
      expect(isUserMessage(msg)).toBe(true);
    });

    it("should return false for event message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "subscribe",
      };
      expect(isUserMessage(msg)).toBe(false);
    });

    it("should return false when MsgType is missing", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        Event: "subscribe",
      };
      expect(isUserMessage(msg)).toBe(false);
    });
  });

  describe("isEventMessage", () => {
    it("should return true for event message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "subscribe",
      };
      expect(isEventMessage(msg)).toBe(true);
    });

    it("should return false for user message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "text",
        Content: "Hello",
      };
      expect(isEventMessage(msg)).toBe(false);
    });
  });

  describe("isSubscribeEvent", () => {
    it("should return true for subscribe event", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "subscribe",
      };
      expect(isSubscribeEvent(msg)).toBe(true);
    });

    it("should return false for other events", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "unsubscribe",
      };
      expect(isSubscribeEvent(msg)).toBe(false);
    });
  });

  describe("isUnsubscribeEvent", () => {
    it("should return true for unsubscribe event", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "unsubscribe",
      };
      expect(isUnsubscribeEvent(msg)).toBe(true);
    });

    it("should return false for other events", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "event",
        Event: "subscribe",
      };
      expect(isUnsubscribeEvent(msg)).toBe(false);
    });
  });

  describe("isLocationMessage", () => {
    it("should return true for location message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "location",
        Location_X: "23.1234",
        Location_Y: "113.5678",
        Scale: 16,
        Label: "Shenzhen",
      };
      expect(isLocationMessage(msg)).toBe(true);
    });

    it("should return false for non-location message", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "text",
        Content: "Hello",
      };
      expect(isLocationMessage(msg)).toBe(false);
    });
  });

  describe("extractTextContent", () => {
    it("should extract text content", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "text",
        Content: "Hello, world!",
      };
      expect(extractTextContent(msg)).toBe("Hello, world!");
    });

    it("should return empty string when content is missing", () => {
      const msg: WeComWebhookMessage = {
        ToUserName: "bot",
        FromUserName: "user123",
        CreateTime: 1640995200,
        MsgType: "image",
        MediaId: "media-123",
      };
      expect(extractTextContent(msg)).toBe("");
    });
  });
});
