/* eslint-disable no-console -- this module is the one sanctioned route to the console. */

/**
 * Dev-only logging for library code.
 *
 * Library code must not log in production apps, so every helper here is a
 * no-op unless `isDev` is true. Use these instead of `console.*` (enforced by
 * the `no-console` lint rule) and instead of reading `__DEV__` directly.
 */

/**
 * True in development builds.
 *
 * `__DEV__` is a Metro/React Native global; other bundlers (Vite, Next.js,
 * plain webpack) don't define it and a bare read throws a ReferenceError
 * there. Without it, fall back to `process.env.NODE_ENV`, written out in full
 * (no optional chaining) so bundlers that statically replace that expression
 * still can; if `process` doesn't exist at all, assume production.
 */
export const isDev: boolean = (() => {
  if (typeof __DEV__ !== 'undefined') return !!__DEV__;
  try {
    // No `typeof process` guard: a bundler may have replaced this expression
    // with a string literal even though `process` itself doesn't exist.
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();

/**
 * True in a development build that also sets `EXPO_PUBLIC_DEBUG`: gates
 * internal tracing too noisy for ordinary development.
 */
export const isDebugLogging: boolean =
  isDev &&
  (() => {
    try {
      return !!process.env.EXPO_PUBLIC_DEBUG;
    } catch {
      return false;
    }
  })();

/** `console.log` only when `isDebugLogging`. */
export function debugLog(...args: unknown[]): void {
  if (isDebugLogging) console.log(...args);
}

/** `console.log` in development; no-op in production. */
export function devLog(...args: unknown[]): void {
  if (isDev) console.log(...args);
}

/** `console.warn` in development; no-op in production. */
export function devWarn(...args: unknown[]): void {
  if (isDev) console.warn(...args);
}

/** `console.error` in development; no-op in production. */
export function devError(...args: unknown[]): void {
  if (isDev) console.error(...args);
}

const warnedKeys = new Set<string>();

/**
 * `console.warn` at most once per `key` for the lifetime of the JS runtime,
 * in development only. Use for warnings raised from render paths or other
 * hot code that would otherwise repeat on every call.
 */
export function warnOnce(key: string, ...args: unknown[]): void {
  if (!isDev || warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(...args);
}

/** Forgets which `warnOnce` keys have fired. For tests. */
export function resetWarnOnce(): void {
  warnedKeys.clear();
}
