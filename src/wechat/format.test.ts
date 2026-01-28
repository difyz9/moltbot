/**
 * WeChat Message Formatting Tests
 */

import { describe, it, expect } from "vitest";
import {
  formatWeChatMessage,
  formatWeChatTarget,
  parseWeChatTarget,
  truncateWeChatText,
  formatWeChatMentions,
} from "../format.js";
import type { ChannelMessage } from "../../channels/types.js";

describe("WeChat Message Formatting", () => {
  describe("formatWeChatMessage", () => {
    it("should format message with from and text", () => {
      const message: ChannelMessage = {
        id: "msg-1",
        channelId: "wechat",
        from: "user123",
        text: "Hello, world!",
        timestamp: Date.now(),
      };
      const result = formatWeChatMessage(message);
      expect(result).toContain("[user123]");
      expect(result).toContain("Hello, world!");
    });

    it("should format message without from", () => {
      const message: ChannelMessage = {
        id: "msg-2",
        channelId: "wechat",
        text: "Test message",
        timestamp: Date.now(),
      };
      const result = formatWeChatMessage(message);
      expect(result).toBe("Test message");
    });

    it("should format message without text", () => {
      const message: ChannelMessage = {
        id: "msg-3",
        channelId: "wechat",
        from: "user456",
        timestamp: Date.now(),
      };
      const result = formatWeChatMessage(message);
      expect(result).toBe("[user456]");
    });
  });

  describe("formatWeChatTarget", () => {
    it("should format target with wechat prefix", () => {
      expect(formatWeChatTarget("user123")).toBe("wechat:user123");
    });

    it("should keep existing wechat prefix", () => {
      expect(formatWeChatTarget("wechat:user456")).toBe("wechat:user456");
    });
  });

  describe("parseWeChatTarget", () => {
    it("should parse target with wechat prefix", () => {
      expect(parseWeChatTarget("wechat:user123")).toBe("user123");
    });

    it("should parse target with wx prefix", () => {
      expect(parseWeChatTarget("wx:user456")).toBe("user456");
    });

    it("should return raw input without prefix", () => {
      expect(parseWeChatTarget("user789")).toBe("user789");
    });

    it("should trim input", () => {
      expect(parseWeChatTarget("  wechat:user123  ")).toBe("user123");
    });
  });

  describe("truncateWeChatText", () => {
    it("should not truncate short text", () => {
      const text = "Short message";
      expect(truncateWeChatText(text, 2048)).toBe(text);
    });

    it("should truncate long text", () => {
      const text = "A".repeat(3000);
      const result = truncateWeChatText(text, 2048);
      expect(result.length).toBe(2048);
      expect(result).toContain("...");
    });

    it("should use default maxLength", () => {
      const text = "A".repeat(2500);
      const result = truncateWeChatText(text);
      expect(result.length).toBe(2048);
    });
  });

  describe("formatWeChatMentions", () => {
    it("should return empty string for no mentions", () => {
      expect(formatWeChatMentions([])).toBe("");
    });

    it("should format single mention", () => {
      expect(formatWeChatMentions(["user123"])).toBe("@user123");
    });

    it("should format multiple mentions", () => {
      const result = formatWeChatMentions(["user1", "user2", "user3"]);
      expect(result).toContain("@user1");
      expect(result).toContain("@user2");
      expect(result).toContain("@user3");
    });
  });
});
