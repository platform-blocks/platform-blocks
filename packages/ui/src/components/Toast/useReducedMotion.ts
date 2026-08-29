import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Whether the user has asked the system to reduce motion.
 *
 * Web reads `prefers-reduced-motion`; native reads the OS "Reduce Motion"
 * accessibility setting. A toast is unsolicited motion in the corner of the
 * user's eye, so honouring this is the difference between a notification and a
 * distraction for anyone with vestibular sensitivity — the toast still appears
 * and still dismisses, it just does so without travelling.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (Platform.OS !== 'web') return false;
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      let mql: MediaQueryList;
      try {
        mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      } catch {
        return;
      }
      const handler = (event: MediaQueryListEvent | MediaQueryList) => setReduced(event.matches);
      handler(mql);
      if (mql.addEventListener) {
        mql.addEventListener('change', handler as (event: MediaQueryListEvent) => void);
        return () => mql.removeEventListener('change', handler as (event: MediaQueryListEvent) => void);
      }
      // Safari < 14 only exposes the deprecated listener API.
      const legacy = mql as unknown as {
        addListener: (cb: (e: MediaQueryListEvent) => void) => void;
        removeListener: (cb: (e: MediaQueryListEvent) => void) => void;
      };
      const legacyHandler = handler as (e: MediaQueryListEvent) => void;
      legacy.addListener(legacyHandler);
      return () => legacy.removeListener(legacyHandler);
    }

    let cancelled = false;
    // Guarded rather than awaited directly: the accessor is absent or stubbed
    // out entirely on some platforms and in test renderers.
    const pending = AccessibilityInfo.isReduceMotionEnabled?.();
    if (pending && typeof pending.then === 'function') {
      pending
        .then(value => {
          if (!cancelled) setReduced(!!value);
        })
        .catch(() => {});
    }
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (value: boolean) => setReduced(value)
    );
    return () => {
      cancelled = true;
      subscription?.remove?.();
    };
  }, []);

  return reduced;
}
