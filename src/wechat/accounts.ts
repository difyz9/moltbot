/**
 * WeChat Account Management.
 */

import type {
  ResolvedWeChatAccount,
  WeChatAccountConfig,
} from "../../extensions/wechat/src/types.js";

/**
 * Default WeChat account configuration.
 */
export const DEFAULT_WECHAT_ACCOUNT: WeChatAccountConfig = {
  enabled: false,
  name: "WeChat Bot",
  puppet: "wechaty-puppet-wechat",
  qrCode: true,
};

/**
 * Resolve WeChat account configuration with defaults.
 */
export function resolveWeChatAccountConfig(
  config: WeChatAccountConfig = {},
): ResolvedWeChatAccount {
  return {
    id: "default",
    enabled: config.enabled ?? DEFAULT_WECHAT_ACCOUNT.enabled,
    name: config.name ?? DEFAULT_WECHAT_ACCOUNT.name,
    puppet: config.puppet ?? DEFAULT_WECHAT_ACCOUNT.puppet,
    puppetOptions: config.puppetOptions,
    qrCode: config.qrCode ?? DEFAULT_WECHAT_ACCOUNT.qrCode,
  };
}

/**
 * Validate WeChat account configuration.
 */
export function validateWeChatAccountConfig(config: WeChatAccountConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.puppet && typeof config.puppet !== "string") {
    errors.push("puppet must be a string");
  }

  if (config.name && typeof config.name !== "string") {
    errors.push("name must be a string");
  }

  if (config.qrCode !== undefined && typeof config.qrCode !== "boolean") {
    errors.push("qrCode must be a boolean");
  }

  if (config.puppetOptions && typeof config.puppetOptions !== "object") {
    errors.push("puppetOptions must be an object");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
