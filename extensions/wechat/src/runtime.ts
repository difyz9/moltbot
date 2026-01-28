/**
 * Runtime bindings for WeChat channel plugin.
 */

import type { MoltbotRuntime } from "clawdbot/plugin-sdk";

let runtime: MoltbotRuntime | null = null;

/**
 * Set the runtime instance for the WeChat channel.
 */
export function setWeChatRuntime(rt: MoltbotRuntime): void {
  runtime = rt;
}

/**
 * Get the runtime instance for the WeChat channel.
 */
export function getWeChatRuntime(): MoltbotRuntime {
  if (!runtime) {
    throw new Error("WeChat runtime not initialized");
  }
  return runtime;
}
