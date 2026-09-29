/**
 * Module-level stores behind `useDeviceInfo`, read with `useSyncExternalStore`.
 *
 * Every hook instance shares one set of platform listeners (attached with the
 * first subscriber, detached with the last), and every store has a
 * deterministic server snapshot, so server markup and the hydration pass
 * agree; React re-renders with the live values right after hydrating.
 */
import { AccessibilityInfo, Appearance, Dimensions } from 'react-native';

import { hasDOM, isNative, isWeb } from '../../core/platform/flags';
import {
  getServerViewportSnapshot,
  getViewportSnapshot,
  subscribeViewport,
} from '../../core/responsive/viewportStore';
import {
  CONTRAST_QUERIES,
  SERVER_INPUT,
  SERVER_LOCALE,
  detectLocale,
  getColorScheme,
  getInputState,
  getWebContrastPreference,
  inputStateEqual,
  localeEqual,
  readPixelMetrics,
} from './detect';
import type { ColorSchemePreference, ContrastPreference, InputState, LocaleState, ScreenMetrics } from './types';

type Listener = () => void;

export interface ExternalStore<T> {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
}

/**
 * A cached, shared snapshot of `read()`. `attach(onChange)` starts the platform
 * listeners and returns their cleanup; `equal` keeps the snapshot's identity
 * while the value is unchanged (a `useSyncExternalStore` requirement).
 */
function createExternalStore<T>(options: {
  read: () => T;
  attach: (onChange: Listener) => () => void;
  serverSnapshot: T;
  equal?: (a: T, b: T) => boolean;
}): ExternalStore<T> {
  const { read, attach, serverSnapshot, equal = Object.is } = options;
  const listeners = new Set<Listener>();
  let snapshot: { value: T } | null = null;
  let detach: (() => void) | null = null;

  const refresh = (): boolean => {
    const next = read();
    if (snapshot && equal(snapshot.value, next)) return false;
    snapshot = { value: next };
    return true;
  };

  const onChange = () => {
    if (refresh()) listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!detach) {
        detach = attach(onChange);
        // The value may have moved while nobody was listening.
        refresh();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && detach) {
          detach();
          detach = null;
        }
      };
    },
    getSnapshot() {
      // Nobody keeps the cache fresh while unsubscribed: read the platform.
      if (!detach || !snapshot) refresh();
      return (snapshot as { value: T }).value;
    },
    getServerSnapshot: () => serverSnapshot,
  };
}

const noop = () => {};

/** Subscribes to each media query's `change` event (with the pre-Safari-14 fallback). */
function listenToMediaQueries(queries: readonly string[], onChange: Listener): () => void {
  if (!hasDOM || typeof window.matchMedia !== 'function') return noop;
  const cleanups = queries.map((query) => {
    const mql = window.matchMedia(query);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    const legacy = mql as unknown as {
      addListener?: (cb: Listener) => void;
      removeListener?: (cb: Listener) => void;
    };
    legacy.addListener?.(onChange);
    return () => legacy.removeListener?.(onChange);
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

// -------------------------------------------------------------
// Screen: viewport size from core/responsive + pixel density / font scale
// -------------------------------------------------------------

const readScreen = (): ScreenMetrics => {
  const { width, height } = getViewportSnapshot();
  return { width, height, ...readPixelMetrics() };
};

const SERVER_SCREEN: ScreenMetrics = Object.freeze({
  ...getServerViewportSnapshot(),
  scale: 1,
  fontScale: 1,
});

export const screenStore = createExternalStore<ScreenMetrics>({
  read: readScreen,
  attach(onChange) {
    const unsubscribeViewport = subscribeViewport(onChange);
    // A font-scale or density change doesn't resize the viewport on native, so
    // the viewport store stays quiet; listen for those directly. (On web both
    // arrive as a window resize.)
    const subscription = isNative ? Dimensions.addEventListener('change', onChange) : undefined;
    return () => {
      unsubscribeViewport();
      subscription?.remove?.();
    };
  },
  serverSnapshot: SERVER_SCREEN,
  equal: (a, b) =>
    a.width === b.width && a.height === b.height && a.scale === b.scale && a.fontScale === b.fontScale,
});

// -------------------------------------------------------------
// Color scheme
// -------------------------------------------------------------

export const colorSchemeStore = createExternalStore<ColorSchemePreference>({
  read: getColorScheme,
  attach(onChange) {
    const subscription = Appearance?.addChangeListener?.(onChange);
    return () => subscription?.remove?.();
  },
  serverSnapshot: 'no-preference',
});

// -------------------------------------------------------------
// Contrast: web media queries; native "bold text" (iOS)
// -------------------------------------------------------------

let nativeContrast: ContrastPreference = 'no-preference';

export const contrastStore = createExternalStore<ContrastPreference>({
  read: () => (isWeb ? getWebContrastPreference() : nativeContrast),
  attach(onChange) {
    if (isWeb) return listenToMediaQueries(CONTRAST_QUERIES, onChange);

    let active = true;
    const set = (enabled: boolean) => {
      nativeContrast = enabled ? 'more' : 'no-preference';
      onChange();
    };
    // Guarded: absent or stubbed out on some platforms and in test renderers.
    const pending = AccessibilityInfo.isBoldTextEnabled?.();
    if (pending && typeof pending.then === 'function') {
      pending.then((enabled) => { if (active) set(!!enabled); }).catch(noop);
    }
    const subscription = AccessibilityInfo.addEventListener?.('boldTextChanged', (enabled: boolean) => set(!!enabled));
    return () => {
      active = false;
      subscription?.remove?.();
    };
  },
  serverSnapshot: 'no-preference',
});

// -------------------------------------------------------------
// Input (pointer capabilities)
// -------------------------------------------------------------

export const inputStore = createExternalStore<InputState>({
  read: getInputState,
  attach: (onChange) => (isWeb ? listenToMediaQueries(['(pointer: fine)', '(pointer: coarse)'], onChange) : noop),
  serverSnapshot: SERVER_INPUT,
  equal: inputStateEqual,
});

// -------------------------------------------------------------
// Locale
// -------------------------------------------------------------

export const localeStore = createExternalStore<LocaleState>({
  read: detectLocale,
  attach(onChange) {
    if (!hasDOM) return noop;
    window.addEventListener('languagechange', onChange);
    return () => window.removeEventListener('languagechange', onChange);
  },
  serverSnapshot: SERVER_LOCALE,
  equal: localeEqual,
});

// -------------------------------------------------------------
// "Is this a live client render?" — false on the server and while hydrating
// -------------------------------------------------------------

const subscribeNothing = () => noop;
export const clientStore: ExternalStore<boolean> = {
  subscribe: subscribeNothing,
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};
