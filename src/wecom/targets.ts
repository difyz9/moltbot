/**
 * WeChat Work Target Resolution.
 */

import type { ResolvedWeComAccount } from "./accounts.js";
import { getWeComBot } from "./bot.js";

/**
 * WeCom target type.
 */
export type WeComTargetType = "user" | "department" | "tag";

/**
 * Resolved WeCom target.
 */
export interface ResolvedWeComTarget {
  id: string;
  type: WeComTargetType;
  name?: string;
}

/**
 * Resolve WeCom target by ID.
 */
export async function resolveWeComTarget(
  account: ResolvedWeComAccount,
  targetId: string,
  targetType: WeComTargetType = "user",
): Promise<ResolvedWeComTarget | null> {
  const bot = getWeComBot(account);

  if (targetType === "user") {
    try {
      const userInfo = await bot.getUserInfo(targetId);
      return {
        id: targetId,
        type: "user",
        name: userInfo.name,
      };
    } catch {
      return null;
    }
  }

  if (targetType === "department") {
    try {
      const deptId = Number.parseInt(targetId, 10);
      const deptInfo = await bot.getDepartmentInfo(deptId);
      const dept = deptInfo.find((d) => d.id === deptId);
      if (dept) {
        return {
          id: targetId,
          type: "department",
          name: dept.name,
        };
      }
    } catch {
      return null;
    }
  }

  // Tags don't have a resolution API, just return as-is
  return {
    id: targetId,
    type: "tag",
    name: targetId,
  };
}

/**
 * Search WeCom targets by name.
 */
export async function searchWeComTargets(
  account: ResolvedWeComAccount,
  query: string,
): Promise<ResolvedWeComTarget[]> {
  const bot = getWeComBot(account);
  const results: ResolvedWeComTarget[] = [];

  // Search departments
  try {
    const departments = await bot.getDepartmentInfo();
    for (const dept of departments) {
      if (dept.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: String(dept.id),
          type: "department",
          name: dept.name,
        });
      }
    }
  } catch {
    // Ignore errors
  }

  return results;
}

/**
 * Get all WeCom targets for an account (departments).
 */
export async function getAllWeComTargets(
  account: ResolvedWeComAccount,
): Promise<ResolvedWeComTarget[]> {
  const bot = getWeComBot(account);
  const results: ResolvedWeComTarget[] = [];

  // Get all departments
  try {
    const departments = await bot.getDepartmentInfo();
    for (const dept of departments) {
      results.push({
        id: String(dept.id),
        type: "department",
        name: dept.name,
      });
    }
  } catch {
    // Ignore errors
  }

  return results;
}
