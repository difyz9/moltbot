/**
 * WeChat Work Account Audit.
 */

import type { ResolvedWeComAccount } from "./accounts.js";
import { probeWeComConnection } from "./probe.js";
import { validateWeComAccountConfig } from "./accounts.js";
import type { WeComAccountConfig } from "../config/types.wecom.js";

/**
 * Audit result for WeCom account.
 */
export interface WeComAuditResult {
  configured: boolean;
  reachable: boolean;
  hasValidCredentials: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Perform comprehensive audit on WeCom account.
 */
export async function auditWeComAccount(
  account: ResolvedWeComAccount,
  config: WeComAccountConfig = {},
  timeoutMs = 10000,
): Promise<WeComAuditResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Validate configuration
  const validation = validateWeComAccountConfig(config);
  if (!validation.valid) {
    errors.push(...validation.errors);
  }

  // Check if enabled
  if (!account.enabled) {
    info.push("Account is disabled");
    return {
      configured: validation.valid,
      reachable: false,
      hasValidCredentials: false,
      errors,
      warnings,
      info,
    };
  }

  // Check required fields
  if (!account.corpId) {
    errors.push("corpId is required");
  }

  if (!account.agentId) {
    errors.push("agentId is required");
  }

  if (!account.secret && !account.accessToken) {
    warnings.push("No secret or access token provided");
  }

  // Probe connection
  const probe = await probeWeComConnection(account, timeoutMs);

  if (probe.error) {
    errors.push(`Connection error: ${probe.error}`);
  }

  if (!probe.connected) {
    warnings.push("Bot is not connected to WeCom");
  }

  if (probe.hasAccessToken) {
    info.push("Access token is valid");
  }

  // Check API type
  if (account.apiType === "webhook") {
    if (!account.webhookUrl) {
      warnings.push("Webhook URL not configured");
    } else {
      info.push("Webhook mode configured");
    }
  } else if (account.apiType === "callback") {
    if (!account.callbackUrl) {
      warnings.push("Callback URL not configured");
    } else {
      info.push("Callback mode configured");
    }
  }

  return {
    configured: validation.valid && errors.length === 0,
    reachable: probe.connected,
    hasValidCredentials: probe.hasAccessToken,
    errors,
    warnings,
    info,
  };
}

/**
 * Generate audit summary.
 */
export function generateWeComAuditSummary(audit: WeComAuditResult): string {
  const lines: string[] = [];

  lines.push(`Configured: ${audit.configured ? "Yes" : "No"}`);
  lines.push(`Reachable: ${audit.reachable ? "Yes" : "No"}`);
  lines.push(`Valid Credentials: ${audit.hasValidCredentials ? "Yes" : "No"}`);

  if (audit.errors.length > 0) {
    lines.push("\nErrors:");
    audit.errors.forEach((error) => lines.push(`  - ${error}`));
  }

  if (audit.warnings.length > 0) {
    lines.push("\nWarnings:");
    audit.warnings.forEach((warning) => lines.push(`  - ${warning}`));
  }

  if (audit.info.length > 0) {
    lines.push("\nInfo:");
    audit.info.forEach((info) => lines.push(`  - ${info}`));
  }

  return lines.join("\n");
}
