import { useEffect, useLayoutEffect } from 'react';

import { hasDOM, isNative } from '../platform/flags';

/**
 * `useLayoutEffect` wherever there is a layout to run before paint (the
 * browser and React Native) and `useEffect` during static rendering, where
 * `useLayoutEffect` only warns and there is nothing to measure or mutate.
 */
export const useIsomorphicLayoutEffect = hasDOM || isNative ? useLayoutEffect : useEffect;
