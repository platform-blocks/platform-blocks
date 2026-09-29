import React, { useContext } from 'react';

import { warnOnce } from '../utils/logger';
import { ReducedMotionOverrideContext, useReducedMotion } from './useReducedMotion';

/** `true`/`false` force reduced motion on/off for the subtree; `'system'` follows the OS. */
export type ReducedMotionSetting = boolean | 'system';

/** @deprecated The provider's context now holds only the override; use `useReducedMotion()`. */
export interface ReducedMotionContextValue {
  reduced: boolean;
}

export interface ReducedMotionProviderProps {
  children: React.ReactNode;
  /**
   * `true` / `false` force the value for this subtree; `'system'` follows the OS
   * preference. Omitted: inherit the parent provider's setting (or the OS).
   */
  reducedMotion?: ReducedMotionSetting;
  /** @deprecated Use `reducedMotion`. */
  forcedValue?: boolean;
}

/**
 * Optional override for `useReducedMotion()`. Not needed for the OS preference
 * (the hook reads that without a provider); use it to force motion off (or on)
 * for a subtree, e.g. screenshots, tests, or an in-app "reduce motion" setting.
 * `PlatformBlocksProvider` mounts one from its `reducedMotion` prop.
 *
 * @example
 * <ReducedMotionProvider reducedMotion>
 *   <App />
 * </ReducedMotionProvider>
 */
export const ReducedMotionProvider: React.FC<ReducedMotionProviderProps> = ({
  children,
  reducedMotion,
  forcedValue,
}) => {
  const parentOverride = useContext(ReducedMotionOverrideContext);

  if (forcedValue !== undefined) {
    warnOnce(
      'ReducedMotionProvider:forcedValue',
      '[platform-blocks] ReducedMotionProvider `forcedValue` is deprecated; use `reducedMotion` instead.'
    );
  }

  let override: boolean | undefined;
  if (typeof reducedMotion === 'boolean') override = reducedMotion;
  else if (reducedMotion === 'system') override = undefined;
  else if (forcedValue !== undefined) override = forcedValue;
  else override = parentOverride;

  // The value is a primitive, so consumers only re-render when it actually changes.
  return (
    <ReducedMotionOverrideContext.Provider value={override}>
      {children}
    </ReducedMotionOverrideContext.Provider>
  );
};

ReducedMotionProvider.displayName = 'ReducedMotionProvider';

export { useReducedMotion };
