/**
 * WeChat Work (WeCom) account tests.
 */

import { describe, expect, it } from "vitest";

import type { MoltbotConfig } from "../config/config.js";
import { resolveWeComAccount, listWeComAccountIds } from "./accounts.js";

describe("resolveWeComAccount", () => {
  it("resolves account with minimal config", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            default: {
              enabled: true,
              corpId: "ww1234567890abcdef",
              agentId: 1000001,
              secret: "test-secret",
            },
          },
        },
      },
    };

    const account = resolveWeComAccount({ cfg, accountId: "default" });
    expect(account.id).toBe("default");
    expect(account.enabled).toBe(true);
    expect(account.corpId).toBe("ww1234567890abcdef");
    expect(account.agentId).toBe("1000001");
    expect(account.secret).toBe("test-secret");
    expect(account.apiType).toBe("webhook");
    expect(account.verifySsl).toBe(true);
    expect(account.timeoutSeconds).toBe(30);
    expect(account.dmPolicy).toBe("pairing");
    expect(account.groupPolicy).toBe("open");
  });

  it("resolves account with custom values", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            custom: {
              enabled: true,
              corpId: "ww0987654321fedcba",
              agentId: 1000002,
              secret: "custom-secret",
              apiType: "callback",
              callbackUrl: "https://example.com/callback",
              verifySsl: false,
              timeoutSeconds: 60,
              dmPolicy: "open",
              groupPolicy: "allowlist",
              allowFrom: ["user1", "user2"],
            },
          },
        },
      },
    };

    const account = resolveWeComAccount({ cfg, accountId: "custom" });
    expect(account.apiType).toBe("callback");
    expect(account.callbackUrl).toBe("https://example.com/callback");
    expect(account.verifySsl).toBe(false);
    expect(account.timeoutSeconds).toBe(60);
    expect(account.dmPolicy).toBe("open");
    expect(account.groupPolicy).toBe("allowlist");
    expect(account.allowFrom).toEqual(["user1", "user2"]);
  });

  it("resolves account with webhook configuration", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            webhook: {
              enabled: true,
              corpId: "ww1234567890",
              agentId: 1,
              secret: "secret",
              apiType: "webhook",
              webhookUrl: "https://example.com/webhook",
              webhookToken: "webhook-token",
              encodingAESKey: "aes-key-123",
            },
          },
        },
      },
    };

    const account = resolveWeComAccount({ cfg, accountId: "webhook" });
    expect(account.apiType).toBe("webhook");
    expect(account.webhookUrl).toBe("https://example.com/webhook");
    expect(account.webhookToken).toBe("webhook-token");
    expect(account.encodingAESKey).toBe("aes-key-123");
  });

  it("resolves account with proxy", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            proxy: {
              enabled: true,
              corpId: "ww1234567890",
              agentId: 1,
              secret: "secret",
              proxy: "http://proxy.example.com:8080",
            },
          },
        },
      },
    };

    const account = resolveWeComAccount({ cfg, accountId: "proxy" });
    expect(account.proxy).toBe("http://proxy.example.com:8080");
  });

  it("throws when account not found", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {},
        },
      },
    };

    expect(() => resolveWeComAccount({ cfg, accountId: "nonexistent" })).toThrow(
      "WeCom account not found: nonexistent",
    );
  });

  it("applies default values for missing fields", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            default: {
              enabled: true,
              corpId: "ww1234567890",
              agentId: 1,
              secret: "secret",
            },
          },
        },
      },
    };

    const account = resolveWeComAccount({ cfg, accountId: "default" });
    expect(account.accessToken).toBe("");
    expect(account.webhookUrl).toBeUndefined();
    expect(account.webhookToken).toBeUndefined();
    expect(account.encodingAESKey).toBeUndefined();
    expect(account.callbackUrl).toBeUndefined();
    expect(account.proxy).toBeUndefined();
    expect(account.allowFrom).toEqual([]);
    expect(account.groupAllowFrom).toEqual([]);
    expect(account.groups).toEqual({});
    expect(account.historyLimit).toBe(20);
    expect(account.dmHistoryLimit).toBe(10);
    expect(account.textChunkLimit).toBe(2048);
    expect(account.chunkMode).toBe("length");
    expect(account.blockStreaming).toBe(true);
    expect(account.mediaMaxMb).toBe(20);
  });
});

describe("listWeComAccountIds", () => {
  it("returns enabled account IDs", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            account1: { enabled: true },
            account2: { enabled: true },
            account3: { enabled: false },
          },
        },
      },
    };

    const accountIds = listWeComAccountIds(cfg);
    expect(accountIds).toEqual(["account1", "account2"]);
  });

  it("returns empty array when no accounts", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {},
        },
      },
    };

    const accountIds = listWeComAccountIds(cfg);
    expect(accountIds).toEqual([]);
  });

  it("includes accounts when enabled is undefined", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wecom: {
          accounts: {
            account1: {},
            account2: { enabled: false },
          },
        },
      },
    };

    const accountIds = listWeComAccountIds(cfg);
    expect(accountIds).toEqual(["account1"]);
  });
});
