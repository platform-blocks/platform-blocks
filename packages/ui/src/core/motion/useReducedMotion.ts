import { createContext, useContext, useSyncExternalStore } from 'react';

import {
  getReducedMotionServerSnapshot,
  getReducedMotionSnapshot,
  subscribeReducedMotion,
} from './reducedMotionStore';

/**
 * Override set by the nearest `ReducedMotionProvider`: `true`/`false` force the
 * value, `undefined` follows the OS preference.
 */
export const ReducedMotionOverrideContext = createContext<boolean | undefined>(undefined);
ReducedMotionOverrideContext.displayName = 'ReducedMotionOverrideContext';

const noopSubscribe = () => () => {};

/**
 * Whether animations should be reduced. The single implementation used by every
 * component: the nearest `ReducedMotionProvider` override if one is set,
 * otherwise the OS preference (AccessibilityInfo on native,
 * `prefers-reduced-motion` on web). Works without any provider. SSR: `false`.
 *
 * Treat `true` as "apply end states immediately" — skip travel/scale/spring
 * animations; opacity fades may stay if short.
 *
 * @example
 * const reduced = useReducedMotion();
 * const duration = reduced ? 0 : 200;
 */
export function useReducedMotion(): boolean {
  const override = useContext(ReducedMotionOverrideContext);
  // No OS subscription at all while an override is in force.
  const system = useSyncExternalStore(
    override === undefined ? subscribeReducedMotion : noopSubscribe,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  return override ?? system;
}

export default useReducedMotion;
