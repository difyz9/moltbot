/**
 * WeChat Account Audit.
 */

import type { ResolvedWeChatAccount } from "../../extensions/wechat/src/types.js";
import { probeWeChatConnection } from "./probe.js";
import { validateWeChatAccountConfig } from "./accounts.js";

/**
 * Audit result for WeChat account.
 */
export interface WeChatAuditResult {
  configured: boolean;
  reachable: boolean;
  loggedIn: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Perform comprehensive audit on WeChat account.
 */
export async function auditWeChatAccount(
  account: ResolvedWeChatAccount,
  timeoutMs = 10000,
): Promise<WeChatAuditResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Validate configuration
  const validation = validateWeChatAccountConfig(account);
  if (!validation.valid) {
    errors.push(...validation.errors);
  }

  // Check if enabled
  if (!account.enabled) {
    info.push("Account is disabled");
    return {
      configured: validation.valid,
      reachable: false,
      loggedIn: false,
      errors,
      warnings,
      info,
    };
  }

  // Probe connection
  const probe = await probeWeChatConnection(account, timeoutMs);

  if (probe.error) {
    errors.push(`Connection error: ${probe.error}`);
  }

  if (!probe.connected) {
    warnings.push("Bot is not connected to WeChat");
  }

  if (!probe.loggedIn) {
    warnings.push("User is not logged in");
  } else {
    info.push("User is logged in");
  }

  if (account.qrCode) {
    info.push("QR code login is enabled");
  }

  return {
    configured: validation.valid && errors.length === 0,
    reachable: probe.connected,
    loggedIn: probe.loggedIn,
    errors,
    warnings,
    info,
  };
}

/**
 * Generate audit summary.
 */
export function generateWeChatAuditSummary(audit: WeChatAuditResult): string {
  const lines: string[] = [];

  lines.push(`Configured: ${audit.configured ? "Yes" : "No"}`);
  lines.push(`Reachable: ${audit.reachable ? "Yes" : "No"}`);
  lines.push(`Logged In: ${audit.loggedIn ? "Yes" : "No"}`);

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
