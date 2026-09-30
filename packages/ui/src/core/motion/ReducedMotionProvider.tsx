import React, { useContext } from 'react';

import { ReducedMotionOverrideContext, useReducedMotion } from './useReducedMotion';

/** `true`/`false` force reduced motion on/off for the subtree; `'system'` follows the OS. */
export type ReducedMotionSetting = boolean | 'system';

export interface ReducedMotionProviderProps {
  children: React.ReactNode;
  /**
   * `true` / `false` force the value for this subtree; `'system'` follows the OS
   * preference. Omitted: inherit the parent provider's setting (or the OS).
   */
  reducedMotion?: ReducedMotionSetting;
}

/**
 * Optional override for `useReducedMotion()`. Not needed for the OS preference
 * (the hook reads that without a provider); use it to force motion off (or on)
 * for a subtree, e.g. screenshots, tests, or an in-app "reduce motion" setting.
 * `PlocksProvider` mounts one from its `reducedMotion` prop.
 *
 * @example
 * <ReducedMotionProvider reducedMotion>
 *   <App />
 * </ReducedMotionProvider>
 */
export const ReducedMotionProvider: React.FC<ReducedMotionProviderProps> = ({
  children,
  reducedMotion,
}) => {
  const parentOverride = useContext(ReducedMotionOverrideContext);

  let override: boolean | undefined;
  if (typeof reducedMotion === 'boolean') override = reducedMotion;
  else if (reducedMotion === 'system') override = undefined;
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
