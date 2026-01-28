/**
 * WeChat channel plugin tests.
 */

import { describe, expect, it } from "vitest";

import { wechatPlugin } from "./channel.js";

describe("WeChat channel plugin", () => {
  it("has correct plugin metadata", () => {
    expect(wechatPlugin.id).toBe("wechat");
    expect(wechatPlugin.meta.label).toBe("WeChat");
    expect(wechatPlugin.meta.selectionLabel).toBe("WeChat (Bot API)");
    expect(wechatPlugin.meta.detailLabel).toBe("WeChat Bot");
    expect(wechatPlugin.meta.docsPath).toBe("/channels/wechat");
    expect(wechatPlugin.meta.order).toBe(15);
    expect(wechatPlugin.meta.aliases).toEqual(["wx", "weixin"]);
  });

  it("has correct capabilities", () => {
    expect(wechatPlugin.capabilities.chatTypes).toEqual(["direct", "group"]);
    expect(wechatPlugin.capabilities.polls).toBe(false);
    expect(wechatPlugin.capabilities.reactions).toBe(false);
    expect(wechatPlugin.capabilities.edit).toBe(false);
    expect(wechatPlugin.capabilities.unsend).toBe(false);
    expect(wechatPlugin.capabilities.reply).toBe(true);
    expect(wechatPlugin.capabilities.effects).toBe(false);
    expect(wechatPlugin.capabilities.groupManagement).toBe(false);
    expect(wechatPlugin.capabilities.threads).toBe(false);
    expect(wechatPlugin.capabilities.media).toBe(true);
    expect(wechatPlugin.capabilities.nativeCommands).toBe(false);
    expect(wechatPlugin.capabilities.blockStreaming).toBe(true);
  });

  describe("config.listAccountIds", () => {
    it("returns empty array when no accounts configured", () => {
      const accountIds = wechatPlugin.config.listAccountIds({});
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
      const accountIds = wechatPlugin.config.listAccountIds(cfg);
      expect(accountIds).toEqual(["account1", "account2"]);
    });

    it("includes accounts when enabled is undefined (defaults to true)", () => {
      const cfg = {
        accounts: {
          account1: {},
          account2: { enabled: false },
        },
      };
      const accountIds = wechatPlugin.config.listAccountIds(cfg);
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
            puppet: "wechaty-puppet-wechat",
          },
        },
      };
      const account = wechatPlugin.config.resolveAccount(cfg, "account1");
      expect(account.id).toBe("account1");
      expect(account.enabled).toBe(true);
      expect(account.name).toBe("Test Account");
      expect(account.puppet).toBe("wechaty-puppet-wechat");
      expect(account.qrCode).toBe(true);
    });

    it("throws when account not found", () => {
      const cfg = { accounts: {} };
      expect(() => wechatPlugin.config.resolveAccount(cfg, "nonexistent")).toThrow(
        "WeChat account not found: nonexistent",
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
      const account = wechatPlugin.config.resolveAccount(cfg, undefined);
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
      const defaultId = wechatPlugin.config.defaultAccountId(cfg);
      expect(defaultId).toBe("account2");
    });

    it("returns first account when no default specified", () => {
      const cfg = {
        accounts: {
          account1: { enabled: true },
          account2: { enabled: true },
        },
      };
      const defaultId = wechatPlugin.config.defaultAccountId(cfg);
      expect(defaultId).toBe("account1");
    });

    it("returns default string when no accounts", () => {
      const cfg = { accounts: {} };
      const defaultId = wechatPlugin.config.defaultAccountId(cfg);
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
      const dmPolicy = wechatPlugin.security.resolveDmPolicy({ cfg, accountId: "default" });
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
      const dmPolicy = wechatPlugin.security.resolveDmPolicy({ cfg, accountId: "default" });
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
      const requireMention = wechatPlugin.groups.resolveRequireMention({ cfg, groupId: "test-group" });
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
      const requireMention = wechatPlugin.groups.resolveRequireMention({ cfg, groupId: "test-group" });
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
      const requireMention = wechatPlugin.groups.resolveRequireMention({ cfg, groupId: "any-group" });
      expect(requireMention).toBe(false);
    });
  });

  describe("messaging.normalizeTarget", () => {
    it("removes wechat: prefix", () => {
      const normalized = wechatPlugin.messaging.normalizeTarget("wechat:userid123");
      expect(normalized).toBe("userid123");
    });

    it("removes wx: prefix", () => {
      const normalized = wechatPlugin.messaging.normalizeTarget("wx:userid123");
      expect(normalized).toBe("userid123");
    });

    it("keeps target as-is when no prefix", () => {
      const normalized = wechatPlugin.messaging.normalizeTarget("userid123");
      expect(normalized).toBe("userid123");
    });

    it("trims whitespace", () => {
      const normalized = wechatPlugin.messaging.normalizeTarget("  wechat:userid123  ");
      expect(normalized).toBe("userid123");
    });
  });

  describe("messaging.targetResolver.looksLikeId", () => {
    it("returns true for wechat: prefixed IDs", () => {
      expect(wechatPlugin.messaging.targetResolver.looksLikeId("wechat:userid")).toBe(true);
    });

    it("returns true for wx: prefixed IDs", () => {
      expect(wechatPlugin.messaging.targetResolver.looksLikeId("wx:userid")).toBe(true);
    });

    it("returns true for valid WeChat IDs", () => {
      expect(wechatPlugin.messaging.targetResolver.looksLikeId("wxid_abcdefghijklmnopqr")).toBe(true);
      expect(wechatPlugin.messaging.targetResolver.looksLikeId("gh_1234567890ab")).toBe(true);
    });

    it("returns false for invalid IDs", () => {
      expect(wechatPlugin.messaging.targetResolver.looksLikeId("abc")).toBe(false);
      expect(wechatPlugin.messaging.targetResolver.looksLikeId("abc!@#")).toBe(false);
    });
  });

  describe("config.formatAllowFrom", () => {
    it("normalizes entries to lowercase and removes prefix", () => {
      const formatted = wechatPlugin.config.formatAllowFrom({
        allowFrom: ["WECHAT:USER1", "wx:user2", "user3"],
      });
      expect(formatted).toEqual(["user1", "user2", "user3"]);
    });

    it("filters empty entries", () => {
      const formatted = wechatPlugin.config.formatAllowFrom({
        allowFrom: ["user1", "", "  ", "user2"],
      });
      expect(formatted).toEqual(["user1", "user2"]);
    });

    it("trims entries", () => {
      const formatted = wechatPlugin.config.formatAllowFrom({
        allowFrom: ["  user1  ", " user2 "],
      });
      expect(formatted).toEqual(["user1", "user2"]);
    });
  });
});
