/**
 * WeChat Work Account Management.
 */

import type { WeComAccountConfig } from "../config/types.wecom.js";

/**
 * Default WeCom account configuration.
 */
export const DEFAULT_WECOM_ACCOUNT: WeComAccountConfig = {
  enabled: false,
  name: "WeCom Bot",
  apiType: "webhook",
  verifySsl: true,
  timeoutSeconds: 30,
};

/**
 * Resolved WeChat Work account configuration.
 */
export interface ResolvedWeComAccount {
  id: string;
  enabled: boolean;
  name: string;
  corpId: string;
  agentId: number;
  secret?: string;
  accessToken?: string;
  apiType: "webhook" | "callback";
  webhookUrl?: string;
  webhookToken?: string;
  encodingAESKey?: string;
  callbackUrl?: string;
  verifySsl: boolean;
  timeoutSeconds: number;
  proxy?: string;
}

/**
 * Resolve WeCom account configuration with defaults.
 */
export function resolveWeComAccountConfig(
  id: string,
  config: WeComAccountConfig = {},
): ResolvedWeComAccount {
  return {
    id,
    enabled: config.enabled ?? DEFAULT_WECOM_ACCOUNT.enabled,
    name: config.name ?? DEFAULT_WECOM_ACCOUNT.name,
    corpId: config.corpId ?? "",
    agentId: Number(config.agentId) ?? 0,
    secret: config.secret,
    accessToken: config.accessToken,
    apiType: config.apiType ?? "webhook",
    webhookUrl: config.webhookUrl,
    webhookToken: config.webhookToken,
    encodingAESKey: config.encodingAESKey,
    callbackUrl: config.callbackUrl,
    verifySsl: config.verifySsl ?? DEFAULT_WECOM_ACCOUNT.verifySsl!,
    timeoutSeconds: config.timeoutSeconds ?? DEFAULT_WECOM_ACCOUNT.timeoutSeconds!,
    proxy: config.proxy,
  };
}

/**
 * Validate WeCom account configuration.
 */
export function validateWeComAccountConfig(config: WeComAccountConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.corpId) {
    errors.push("corpId is required");
  }

  if (!config.agentId && !config.secret && !config.accessToken) {
    errors.push("Either agentId+secret or accessToken is required");
  }

  if (config.apiType === "webhook" && !config.webhookUrl) {
    errors.push("webhookUrl is required when apiType is 'webhook'");
  }

  if (config.apiType === "callback" && !config.callbackUrl) {
    errors.push("callbackUrl is required when apiType is 'callback'");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
