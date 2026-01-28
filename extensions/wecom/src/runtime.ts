/**
 * WeChat Work runtime bindings.
 */

let wecomRuntime: unknown = null;

export function getWeComRuntime(): unknown {
  return wecomRuntime;
}

export function setWeComRuntime(runtime: unknown): void {
  wecomRuntime = runtime;
}
