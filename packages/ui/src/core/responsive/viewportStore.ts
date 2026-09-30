/**
 * The one viewport store.
 *
 * A single module-level subscription (window `resize` on web, rAF-throttled;
 * `Dimensions` `change` on native) shared by every consumer through
 * `useSyncExternalStore`. It attaches when the first consumer subscribes and
 * detaches when the last one leaves.
 *
 * Static rendering has no viewport, so the server snapshot is a desktop-sized
 * default (`SERVER_VIEWPORT`, the `xl` breakpoint — what the library has
 * always prerendered). `useSyncExternalStore` hydrates against that snapshot
 * and then re-renders with the real one, so markup never mismatches.
 */
import { Dimensions } from 'react-native';

import { hasDOM, isWeb } from '../platform/flags';
import { DEFAULT_BREAKPOINT_VALUES } from '../theme/scales';

export interface ViewportSize {
  width: number;
  height: number;
}

/** Viewport assumed during static rendering (and before any measurement on web). */
export const SERVER_VIEWPORT: ViewportSize = Object.freeze({
  width: DEFAULT_BREAKPOINT_VALUES.xl,
  height: 800,
});

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: ViewportSize | null = null;
let detach: (() => void) | null = null;

function readViewport(): ViewportSize {
  if (isWeb) {
    // Static rendering has no DOM to measure.
    if (!hasDOM) return SERVER_VIEWPORT;
    return { width: window.innerWidth, height: window.innerHeight };
  }
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

/** Re-reads the viewport; returns true (and replaces the snapshot) when it changed. */
function refresh(): boolean {
  const next = readViewport();
  if (snapshot && snapshot.width === next.width && snapshot.height === next.height) return false;
  snapshot = next;
  return true;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function attach(): () => void {
  if (isWeb) {
    if (!hasDOM) return () => {};
    let frame: number | null = null;
    const schedule =
      typeof window.requestAnimationFrame === 'function'
        ? (cb: () => void) => window.requestAnimationFrame(cb)
        : (cb: () => void) => setTimeout(cb, 16) as unknown as number;
    const cancel =
      typeof window.cancelAnimationFrame === 'function'
        ? (id: number) => window.cancelAnimationFrame(id)
        : (id: number) => clearTimeout(id);
    const onResize = () => {
      if (frame !== null) return;
      frame = schedule(() => {
        frame = null;
        if (refresh()) emit();
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (frame !== null) cancel(frame);
      frame = null;
    };
  }

  const subscription = Dimensions.addEventListener('change', () => {
    if (refresh()) emit();
  });
  return () => subscription?.remove?.();
}

/** `useSyncExternalStore` subscribe function for the viewport. */
export function subscribeViewport(listener: Listener): () => void {
  listeners.add(listener);
  if (!detach) {
    detach = attach();
    // The value may have moved while nobody was listening. React re-reads the
    // snapshot right after subscribing, so refreshing the cache is enough.
    refresh();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && detach) {
      detach();
      detach = null;
    }
  };
}

/**
 * Current viewport size. Referentially stable until the size changes. While
 * nobody is subscribed it reads the platform directly (no listener keeps the
 * cache fresh then).
 */
export function getViewportSnapshot(): ViewportSize {
  if (!detach || !snapshot) refresh();
  return snapshot as ViewportSize;
}

/** Server / hydration snapshot: the desktop default. */
export function getServerViewportSnapshot(): ViewportSize {
  return SERVER_VIEWPORT;
}

/** Test helper: drops the cached snapshot and detaches the listener. */
export function resetViewportStore(): void {
  if (detach) detach();
  detach = null;
  snapshot = null;
  listeners.clear();
}
