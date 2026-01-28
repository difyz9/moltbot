/**
 * WeChat Monitor Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getWeChatMonitorMetrics,
  initWeChatMonitor,
  updateWeChatConnectionStatus,
  incrementWeChatMessagesReceived,
  incrementWeChatMessagesSent,
  recordWeChatError,
  getAllWeChatMonitorMetrics,
  removeWeChatMonitor,
} from "../monitor.js";

describe("WeChat Monitor", () => {
  const testAccountId = "test-account";

  beforeEach(() => {
    // Clean up before each test
    removeWeChatMonitor(testAccountId);
  });

  describe("getWeChatMonitorMetrics", () => {
    it("should return undefined for non-existent account", () => {
      const metrics = getWeChatMonitorMetrics("non-existent");
      expect(metrics).toBeUndefined();
    });

    it("should return metrics for existing account", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });
      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics).toBeDefined();
      expect(metrics?.accountId).toBe(testAccountId);
    });
  });

  describe("initWeChatMonitor", () => {
    it("should initialize monitor with default values", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics).toEqual({
        accountId: testAccountId,
        connected: false,
        messagesReceived: 0,
        messagesSent: 0,
      });
    });

    it("should override existing monitor", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      incrementWeChatMessagesReceived(testAccountId);

      // Re-initialize should reset
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.messagesReceived).toBe(0);
    });
  });

  describe("updateWeChatConnectionStatus", () => {
    it("should update connection status to true", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      updateWeChatConnectionStatus(testAccountId, true);
      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.connected).toBe(true);
    });

    it("should update connection status to false", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      updateWeChatConnectionStatus(testAccountId, true);
      updateWeChatConnectionStatus(testAccountId, false);

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.connected).toBe(false);
    });

    it("should not update non-existent monitor", () => {
      expect(() => updateWeChatConnectionStatus("non-existent", true)).not.toThrow();
    });
  });

  describe("incrementWeChatMessagesReceived", () => {
    it("should increment messages received count", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      incrementWeChatMessagesReceived(testAccountId);
      incrementWeChatMessagesReceived(testAccountId);

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.messagesReceived).toBe(2);
    });

    it("should set last message time", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      const before = Date.now();
      incrementWeChatMessagesReceived(testAccountId);

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.lastMessageTime).toBeInstanceOf(Date);
      expect(metrics?.lastMessageTime?.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe("incrementWeChatMessagesSent", () => {
    it("should increment messages sent count", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      incrementWeChatMessagesSent(testAccountId);
      incrementWeChatMessagesSent(testAccountId);
      incrementWeChatMessagesSent(testAccountId);

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.messagesSent).toBe(3);
    });
  });

  describe("recordWeChatError", () => {
    it("should record error and set connected to false", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      updateWeChatConnectionStatus(testAccountId, true);

      const error = new Error("Connection failed");
      recordWeChatError(testAccountId, error);

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics?.connected).toBe(false);
      expect(metrics?.lastError).toBe(error);
    });
  });

  describe("getAllWeChatMonitorMetrics", () => {
    it("should return empty array when no monitors exist", () => {
      const allMetrics = getAllWeChatMonitorMetrics();
      expect(allMetrics).toEqual([]);
    });

    it("should return all monitor metrics", () => {
      initWeChatMonitor({
        id: "account1",
        enabled: true,
        name: "Account 1",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      initWeChatMonitor({
        id: "account2",
        enabled: true,
        name: "Account 2",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      const allMetrics = getAllWeChatMonitorMetrics();
      expect(allMetrics).toHaveLength(2);
      expect(allMetrics.map((m) => m.accountId)).toEqual(
        expect.arrayContaining(["account1", "account2"]),
      );
    });
  });

  describe("removeWeChatMonitor", () => {
    it("should remove monitor", () => {
      initWeChatMonitor({
        id: testAccountId,
        enabled: true,
        name: "Test",
        puppet: "wechaty-puppet-wechat",
        qrCode: true,
      });

      removeWeChatMonitor(testAccountId);

      const metrics = getWeChatMonitorMetrics(testAccountId);
      expect(metrics).toBeUndefined();
    });

    it("should not throw when removing non-existent monitor", () => {
      expect(() => removeWeChatMonitor("non-existent")).not.toThrow();
    });
  });
});
