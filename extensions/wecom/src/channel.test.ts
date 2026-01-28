/**
 * WeChat Work (WeCom) channel plugin tests.
 */

import { describe, expect, it } from "vitest";

import { wecomPlugin } from "./channel.js";

describe("WeCom channel plugin", () => {
  it("has correct plugin metadata", () => {
    expect(wecomPlugin.id).toBe("wecom");
    expect(wecomPlugin.meta.label).toBe("WeChat Work");
    expect(wecomPlugin.meta.selectionLabel).toBe("WeChat Work (WeCom)");
    expect(wecomPlugin.meta.detailLabel).toBe("WeCom Bot");
    expect(wecomPlugin.meta.docsPath).toBe("/channels/wecom");
    expect(wecomPlugin.meta.order).toBe(16);
    expect(wecomPlugin.meta.aliases).toEqual(["we-chat-work", "qiye"]);
  });

  it("has correct capabilities", () => {
    expect(wecomPlugin.capabilities.chatTypes).toEqual(["direct", "group"]);
    expect(wecomPlugin.capabilities.polls).toBe(false);
    expect(wecomPlugin.capabilities.reactions).toBe(false);
    expect(wecomPlugin.capabilities.edit).toBe(false);
    expect(wecomPlugin.capabilities.unsend).toBe(false);
    expect(wecomPlugin.capabilities.reply).toBe(true);
    expect(wecomPlugin.capabilities.effects).toBe(false);
    expect(wecomPlugin.capabilities.groupManagement).toBe(false);
    expect(wecomPlugin.capabilities.threads).toBe(false);
    expect(wecomPlugin.capabilities.media).toBe(true);
    expect(wecomPlugin.capabilities.nativeCommands).toBe(false);
    expect(wecomPlugin.capabilities.blockStreaming).toBe(true);
  });

  describe("config.listAccountIds", () => {
    it("returns empty array when no accounts configured", () => {
      const accountIds = wecomPlugin.config.listAccountIds({});
      expect(accountIds).toEqual([]);
    });

    it("returns enabled account IDs", () => {
      const cfg = {
        accounts: {
          account1: { enabled: true },
          account2: { enabled: true },
          account3: { enabled: false },
        },
      };
      const accountIds = wecomPlugin.config.listAccountIds(cfg);
      expect(accountIds).toEqual(["account1", "account2"]);
    });

    it("includes accounts when enabled is undefined (defaults to true)", () => {
      const cfg = {
        accounts: {
          account1: {},
          account2: { enabled: false },
        },
      };
      const accountIds = wecomPlugin.config.listAccountIds(cfg);
      expect(accountIds).toEqual(["account1"]);
    });
  });

  describe("config.resolveAccount", () => {
    it("resolves account with defaults", () => {
      const cfg = {
        accounts: {
          account1: {
            enabled: true,
            name: "Test Account",
            corpId: "ww1234567890abcdef",
            agentId: 1000001,
            secret: "test-secret",
          },
        },
      };
      const account = wecomPlugin.config.resolveAccount(cfg, "account1");
      expect(account.id).toBe("account1");
      expect(account.enabled).toBe(true);
      expect(account.name).toBe("Test Account");
      expect(account.corpId).toBe("ww1234567890abcdef");
      expect(account.agentId).toBe("1000001");
      expect(account.secret).toBe("test-secret");
      expect(account.apiType).toBe("webhook");
      expect(account.verifySsl).toBe(true);
      expect(account.timeoutSeconds).toBe(30);
      expect(account.dmPolicy).toBe("pairing");
      expect(account.groupPolicy).toBe("open");
      expect(account.blockStreaming).toBe(true);
      expect(account.mediaMaxMb).toBe(20);
    });

    it("throws when account not found", () => {
      const cfg = { accounts: {} };
      expect(() => wecomPlugin.config.resolveAccount(cfg, "nonexistent")).toThrow(
        "WeCom account not found: nonexistent",
      );
    });

    it("uses default account when accountId is omitted", () => {
      const cfg = {
        accounts: {
          default: {
            enabled: true,
            name: "Default Account",
          },
        },
      };
      const account = wecomPlugin.config.resolveAccount(cfg, undefined);
      expect(account.id).toBe("default");
    });
  });

  describe("config.defaultAccountId", () => {
    it("returns default when specified", () => {
      const cfg = {
        accounts: {
          account1: { enabled: true },
          account2: { enabled: true },
        },
        defaultAccountId: "account2",
      };
      const defaultId = wecomPlugin.config.defaultAccountId(cfg);
      expect(defaultId).toBe("account2");
    });

    it("returns first account when no default specified", () => {
      const cfg = {
        accounts: {
          account1: { enabled: true },
          account2: { enabled: true },
        },
      };
      const defaultId = wecomPlugin.config.defaultAccountId(cfg);
      expect(defaultId).toBe("account1");
    });

    it("returns default string when no accounts", () => {
      const cfg = { accounts: {} };
      const defaultId = wecomPlugin.config.defaultAccountId(cfg);
      expect(defaultId).toBe("default");
    });
  });

  describe("security.resolveDmPolicy", () => {
    it("defaults to pairing mode", () => {
      const cfg = {
        accounts: {
          default: {},
        },
      };
      const dmPolicy = wecomPlugin.security.resolveDmPolicy({ cfg, accountId: "default" });
      expect(dmPolicy.mode).toBe("pairing");
    });

    it("respects configured dmPolicy", () => {
      const cfg = {
        accounts: {
          default: {
            dmPolicy: "open",
          },
        },
      };
      const dmPolicy = wecomPlugin.security.resolveDmPolicy({ cfg, accountId: "default" });
      expect(dmPolicy.mode).toBe("open");
    });
  });

  describe("groups.resolveRequireMention", () => {
    it("defaults to requiring mention", () => {
      const cfg = {
        accounts: {
          default: {
            groups: {},
          },
        },
      };
      const requireMention = wecomPlugin.groups.resolveRequireMention({ cfg, groupId: "test-group" });
      expect(requireMention).toBe(true);
    });

    it("respects group-specific requireMention", () => {
      const cfg = {
        accounts: {
          default: {
            groups: {
              "test-group": { requireMention: false },
            },
          },
        },
      };
      const requireMention = wecomPlugin.groups.resolveRequireMention({ cfg, groupId: "test-group" });
      expect(requireMention).toBe(false);
    });

    it("respects wildcard group requireMention", () => {
      const cfg = {
        accounts: {
          default: {
            groups: {
              "*": { requireMention: false },
            },
          },
        },
      };
      const requireMention = wecomPlugin.groups.resolveRequireMention({ cfg, groupId: "any-group" });
      expect(requireMention).toBe(false);
    });
  });

  describe("messaging.normalizeTarget", () => {
    it("removes wecom: prefix", () => {
      const normalized = wecomPlugin.messaging.normalizeTarget("wecom:userid123");
      expect(normalized).toBe("userid123");
    });

    it("removes we-chat-work: prefix", () => {
      const normalized = wecomPlugin.messaging.normalizeTarget("we-chat-work:userid123");
      expect(normalized).toBe("userid123");
    });

    it("removes qiye: prefix", () => {
      const normalized = wecomPlugin.messaging.normalizeTarget("qiye:userid123");
      expect(normalized).toBe("userid123");
    });

    it("keeps target as-is when no prefix", () => {
      const normalized = wecomPlugin.messaging.normalizeTarget("userid123");
      expect(normalized).toBe("userid123");
    });

    it("trims whitespace", () => {
      const normalized = wecomPlugin.messaging.normalizeTarget("  wecom:userid123  ");
      expect(normalized).toBe("userid123");
    });
  });

  describe("messaging.targetResolver.looksLikeId", () => {
    it("returns true for wecom: prefixed IDs", () => {
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("wecom:userid")).toBe(true);
    });

    it("returns true for we-chat-work: prefixed IDs", () => {
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("we-chat-work:userid")).toBe(true);
    });

    it("returns true for qiye: prefixed IDs", () => {
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("qiye:userid")).toBe(true);
    });

    it("returns true for valid WeCom IDs", () => {
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("ZhangSan")).toBe(true);
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("user_123456")).toBe(true);
    });

    it("returns false for invalid IDs", () => {
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("abc")).toBe(false);
      expect(wecomPlugin.messaging.targetResolver.looksLikeId("abc!@#")).toBe(false);
    });
  });

  describe("config.formatAllowFrom", () => {
    it("normalizes entries to lowercase and removes prefix", () => {
      const formatted = wecomPlugin.config.formatAllowFrom({
        allowFrom: ["WECOM:USER1", "we-chat-work:user2", "qiye:user3", "user4"],
      });
      expect(formatted).toEqual(["user1", "user2", "user3", "user4"]);
    });

    it("filters empty entries", () => {
      const formatted = wecomPlugin.config.formatAllowFrom({
        allowFrom: ["user1", "", "  ", "user2"],
      });
      expect(formatted).toEqual(["user1", "user2"]);
    });

    it("trims entries", () => {
      const formatted = wecomPlugin.config.formatAllowFrom({
        allowFrom: ["  user1  ", " user2 "],
      });
      expect(formatted).toEqual(["user1", "user2"]);
    });
  });

  describe("status.collectStatusIssues", () => {
    it("reports issues for disabled account", async () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: false } } },
        "test",
      );
      const issues = await wecomPlugin.status.collectStatusIssues({ account });
      expect(issues).toContain("Account is disabled");
    });

    it("reports issues for missing corpId", async () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: true, agentId: 1, secret: "test" } } },
        "test",
      );
      const issues = await wecomPlugin.status.collectStatusIssues({ account });
      expect(issues).toContain("Missing Corp ID");
    });

    it("reports issues for missing agentId", async () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: true, corpId: "test", secret: "test" } } },
        "test",
      );
      const issues = await wecomPlugin.status.collectStatusIssues({ account });
      expect(issues).toContain("Missing Agent ID");
    });

    it("reports issues for missing secret", async () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: true, corpId: "test", agentId: 1 } } },
        "test",
      );
      const issues = await wecomPlugin.status.collectStatusIssues({ account });
      expect(issues).toContain("Missing Secret");
    });

    it("reports issues for webhook mode without webhookUrl", async () => {
      const account = wecomPlugin.config.resolveAccount(
        {
          accounts: {
            test: { enabled: true, corpId: "test", agentId: 1, secret: "test", apiType: "webhook" },
          },
        },
        "test",
      );
      const issues = await wecomPlugin.status.collectStatusIssues({ account });
      expect(issues).toContain("Webhook URL required for webhook mode");
    });

    it("returns empty issues for fully configured account", async () => {
      const account = wecomPlugin.config.resolveAccount(
        {
          accounts: {
            test: {
              enabled: true,
              corpId: "ww1234567890",
              agentId: 1,
              secret: "test-secret",
              apiType: "webhook",
              webhookUrl: "https://example.com/webhook",
            },
          },
        },
        "test",
      );
      const issues = await wecomPlugin.status.collectStatusIssues({ account });
      expect(issues).toEqual([]);
    });
  });

  describe("config.isConfigured", () => {
    it("returns false for disabled account", () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: false } } },
        "test",
      );
      expect(wecomPlugin.config.isConfigured(account)).toBe(false);
    });

    it("returns false for account without corpId", () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: true } } },
        "test",
      );
      expect(wecomPlugin.config.isConfigured(account)).toBe(false);
    });

    it("returns false for account without agentId", () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: true, corpId: "test" } } },
        "test",
      );
      expect(wecomPlugin.config.isConfigured(account)).toBe(false);
    });

    it("returns false for account without secret", () => {
      const account = wecomPlugin.config.resolveAccount(
        { accounts: { test: { enabled: true, corpId: "test", agentId: 1 } } },
        "test",
      );
      expect(wecomPlugin.config.isConfigured(account)).toBe(false);
    });

    it("returns true for fully configured account", () => {
      const account = wecomPlugin.config.resolveAccount(
        {
          accounts: {
            test: { enabled: true, corpId: "ww1234567890", agentId: 1, secret: "secret" },
          },
        },
        "test",
      );
      expect(wecomPlugin.config.isConfigured(account)).toBe(true);
    });
  });
});
