import { AccessibilityInfo } from 'react-native';

import { hasDOM, isWeb } from '../platform';

/**
 * The one source of truth for the OS "reduce motion" preference.
 *
 * A module-level store (not React state) so every consumer shares one native
 * listener / one media query, and so it can be read with `useSyncExternalStore`.
 * Native: `AccessibilityInfo.isReduceMotionEnabled` + `reduceMotionChanged`.
 * Web: `matchMedia('(prefers-reduced-motion: reduce)')`.
 * The server snapshot is always `false`, so SSR markup is deterministic.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

type Listener = () => void;

const listeners = new Set<Listener>();
let current = false;
let started = false;
let stopListening: (() => void) | null = null;
let mediaQuery: MediaQueryList | null | undefined;

function getMediaQuery(): MediaQueryList | null {
  if (mediaQuery !== undefined) return mediaQuery;
  mediaQuery = null;
  if (hasDOM && typeof window.matchMedia === 'function') {
    try {
      mediaQuery = window.matchMedia(QUERY);
    } catch {
      mediaQuery = null;
    }
  }
  return mediaQuery;
}

function setCurrent(next: boolean) {
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

function startWeb() {
  const mql = getMediaQuery();
  if (!mql) return;
  current = mql.matches;
  const onChange = (event: MediaQueryListEvent) => setCurrent(event.matches);
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onChange);
    stopListening = () => mql.removeEventListener('change', onChange);
  } else {
    // Safari < 14 only has the deprecated listener API.
    const legacy = mql as unknown as {
      addListener: (cb: (event: MediaQueryListEvent) => void) => void;
      removeListener: (cb: (event: MediaQueryListEvent) => void) => void;
    };
    legacy.addListener(onChange);
    stopListening = () => legacy.removeListener(onChange);
  }
}

function startNative() {
  let active = true;
  // Guarded: the accessor is absent or stubbed out on some platforms and in test renderers.
  const pending = AccessibilityInfo.isReduceMotionEnabled?.();
  if (pending && typeof pending.then === 'function') {
    pending.then((value) => { if (active) setCurrent(!!value); }).catch(() => {});
  }
  const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (value: boolean) => {
    setCurrent(!!value);
  });
  stopListening = () => {
    active = false;
    subscription?.remove?.();
  };
}

function start() {
  if (started) return;
  started = true;
  if (isWeb) startWeb();
  else startNative();
}

function stop() {
  stopListening?.();
  stopListening = null;
  started = false;
}

/** Subscribes to changes. Listening starts with the first subscriber and stops with the last. */
export function subscribeReducedMotion(listener: Listener): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/** The current preference. Before anything subscribes, web reads the media query directly. */
export function getReducedMotionSnapshot(): boolean {
  if (!started && isWeb) {
    const mql = getMediaQuery();
    if (mql) current = mql.matches;
  }
  return current;
}

/** Server rendering never knows the user's preference: assume motion is allowed. */
export function getReducedMotionServerSnapshot(): boolean {
  return false;
}
