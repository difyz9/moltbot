/**
 * WeChat account tests.
 */

import { describe, expect, it } from "vitest";

import type { MoltbotConfig } from "../config/config.js";
import { resolveWeChatAccount, listWeChatAccountIds } from "./accounts.js";

describe("resolveWeChatAccount", () => {
  it("resolves account with minimal config", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {
            default: {
              enabled: true,
            },
          },
        },
      },
    };

    const account = resolveWeChatAccount({ cfg, accountId: "default" });
    expect(account.id).toBe("default");
    expect(account.enabled).toBe(true);
    expect(account.puppet).toBe("wechaty-puppet-wechat");
    expect(account.qrCode).toBe(true);
  });

  it("resolves account with custom puppet", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {
            custom: {
              enabled: true,
              puppet: "wechaty-puppet-padlocal",
              puppetOptions: { token: "test-token" },
            },
          },
        },
      },
    };

    const account = resolveWeChatAccount({ cfg, accountId: "custom" });
    expect(account.puppet).toBe("wechaty-puppet-padlocal");
    expect(account.puppetOptions).toEqual({ token: "test-token" });
  });

  it("resolves account with QR code disabled", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {
            default: {
              enabled: true,
              qrCode: false,
            },
          },
        },
      },
    };

    const account = resolveWeChatAccount({ cfg, accountId: "default" });
    expect(account.qrCode).toBe(false);
  });

  it("throws when account not found", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {},
        },
      },
    };

    expect(() => resolveWeChatAccount({ cfg, accountId: "nonexistent" })).toThrow(
      "WeChat account not found: nonexistent",
    );
  });
});

describe("listWeChatAccountIds", () => {
  it("returns enabled account IDs", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {
            account1: { enabled: true },
            account2: { enabled: true },
            account3: { enabled: false },
          },
        },
      },
    };

    const accountIds = listWeChatAccountIds(cfg);
    expect(accountIds).toEqual(["account1", "account2"]);
  });

  it("returns empty array when no accounts", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {},
        },
      },
    };

    const accountIds = listWeChatAccountIds(cfg);
    expect(accountIds).toEqual([]);
  });

  it("includes accounts when enabled is undefined", () => {
    const cfg: MoltbotConfig = {
      channels: {
        wechat: {
          accounts: {
            account1: {},
            account2: { enabled: false },
          },
        },
      },
    };

    const accountIds = listWeChatAccountIds(cfg);
    expect(accountIds).toEqual(["account1"]);
  });
});
