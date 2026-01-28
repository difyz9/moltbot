/**
 * WeChat Work Message Formatting Tests
 */

import { describe, it, expect } from "vitest";
import {
  formatWeComMessage,
  formatWeComTarget,
  parseWeComTarget,
  truncateWeComText,
  formatWeComMarkdown,
  formatWeComTextCard,
} from "../format.js";
import type { ChannelMessage } from "../../channels/types.js";

describe("WeCom Message Formatting", () => {
  describe("formatWeComMessage", () => {
    it("should format message with from and text", () => {
      const message: ChannelMessage = {
        id: "msg-1",
        channelId: "wecom",
        from: "user123",
        text: "Hello, world!",
        timestamp: Date.now(),
      };
      const result = formatWeComMessage(message);
      expect(result).toContain("[user123]");
      expect(result).toContain("Hello, world!");
    });

    it("should format message without from", () => {
      const message: ChannelMessage = {
        id: "msg-2",
        channelId: "wecom",
        text: "Test message",
        timestamp: Date.now(),
      };
      const result = formatWeComMessage(message);
      expect(result).toBe("Test message");
    });

    it("should format message without text", () => {
      const message: ChannelMessage = {
        id: "msg-3",
        channelId: "wecom",
        from: "user456",
        timestamp: Date.now(),
      };
      const result = formatWeComMessage(message);
      expect(result).toBe("[user456]");
    });
  });

  describe("formatWeComTarget", () => {
    it("should format target with type", () => {
      expect(formatWeComTarget("user123", "user")).toBe("wecom:user:user123");
      expect(formatWeComTarget("dept1", "department")).toBe("wecom:department:dept1");
      expect(formatWeComTarget("tag1", "tag")).toBe("wecom:tag:tag1");
    });

    it("should use default type when not specified", () => {
      expect(formatWeComTarget("user123")).toBe("wecom:user:user123");
    });
  });

  describe("parseWeComTarget", () => {
    it("should parse target with wecom prefix and type", () => {
      expect(parseWeComTarget("wecom:user:user123")).toEqual({
        targetId: "user123",
        targetType: "user",
      });
      expect(parseWeComTarget("wecom:department:2")).toEqual({
        targetId: "2",
        targetType: "department",
      });
      expect(parseWeComTarget("wecom:tag:developer")).toEqual({
        targetId: "developer",
        targetType: "tag",
      });
    });

    it("should parse target with wecom prefix only", () => {
      expect(parseWeComTarget("wecom:user123")).toEqual({
        targetId: "user123",
        targetType: "user",
      });
    });

    it("should return raw input without prefix", () => {
      expect(parseWeComTarget("user123")).toEqual({
        targetId: "user123",
        targetType: "user",
      });
    });

    it("should trim input", () => {
      expect(parseWeComTarget("  wecom:user:user123  ")).toEqual({
        targetId: "user123",
        targetType: "user",
      });
    });
  });

  describe("truncateWeComText", () => {
    it("should not truncate short text", () => {
      const text = "Short message";
      expect(truncateWeComText(text, 2048)).toBe(text);
    });

    it("should truncate long text", () => {
      const text = "A".repeat(3000);
      const result = truncateWeComText(text, 2048);
      expect(result.length).toBe(2048);
      expect(result).toContain("...");
    });

    it("should use default maxLength", () => {
      const text = "A".repeat(2500);
      const result = truncateWeComText(text);
      expect(result.length).toBe(2048);
    });
  });

  describe("formatWeComMarkdown", () => {
    it("should return markdown as-is", () => {
      const markdown = "**Bold** and *italic*";
      expect(formatWeComMarkdown(markdown)).toBe(markdown);
    });
  });

  describe("formatWeComTextCard", () => {
    it("should format text card without button", () => {
      const result = formatWeComTextCard("Test Title", "Test Description", "https://example.com");
      expect(result).toContain("**Test Title**");
      expect(result).toContain("Test Description");
      expect(result).toContain("[Read more](https://example.com)");
    });

    it("should format text card with button", () => {
      const result = formatWeComTextCard(
        "Test Title",
        "Test Description",
        "https://example.com",
        "Click Here",
      );
      expect(result).toContain("**Test Title**");
      expect(result).toContain("Test Description");
      expect(result).toContain("[Read more](https://example.com)");
    });
  });
});
