/**
 * Global CSS the library injects on web.
 *
 * - A zero-specificity keyboard focus ring (`:focus-visible`) for every
 *   focusable element, drawn in `--plocks-focus-ring`. It uses
 *   `:where()` so any host-app or component style overrides it. The library's
 *   own text inputs opt out of the raw outline with `dataSet={{ plocksInput: 'true' }}`
 *   (`[data-plocks-input]`) and draw a ring on their frame instead.
 * - A text-input appearance reset (zero specificity; checkboxes, radios,
 *   ranges and selects are left alone so host-app controls keep their chrome).
 *
 * There is deliberately NO global `outline: none` — that hid keyboard focus
 * for the whole page, host-app inputs included.
 */

import { useMemo } from 'react';
import { Platform } from 'react-native';

import { DEFAULT_THEME } from '../theme/defaultTheme';
import { useTheme } from '../theme/ThemeProvider';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

export interface UniversalCSSOptions {
  /** Fallback color for the focus ring when `--plocks-focus-ring` is not defined. */
  focusRing?: string;
}

/** Elements that get the keyboard focus ring. */
export const FOCUS_RING_SELECTOR =
  'button, a, input, textarea, select, [tabindex], [role="button"], [role="checkbox"], [role="switch"], ' +
  '[role="radio"], [role="tab"], [role="slider"], [role="option"], [role="menuitem"]';

/**
 * Generates the global CSS. Pass a theme-derived `options` object; with no
 * argument it uses the default theme.
 */
export function generateUniversalCSS(options: UniversalCSSOptions = {}): string {
  const focusRing = options.focusRing ?? DEFAULT_THEME.states?.focusRing ?? 'rgba(59,130,246,0.45)';

  const universalCSS = `
    /* Keyboard focus ring — zero specificity, so any component or app style wins. */
    :where(${FOCUS_RING_SELECTOR}):focus-visible {
      outline: 2px solid var(--plocks-focus-ring, ${focusRing});
      outline-offset: 2px;
    }

    /* Library text inputs draw their own ring on the field frame. */
    :where([data-plocks-input]):focus,
    :where([data-plocks-input]):focus-visible {
      outline: none;
    }

    /* Text-input appearance reset (prevents double borders) — text-like inputs only. */
    :where(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="color"]), textarea) {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `;

  return universalCSS.replace(/\s+/g, ' ').trim();
}

const STYLE_ID = 'plocks-universal-css';
/** Mounted instances in registration order; the latest one's CSS is the one in the document. */
const instances: { css: string }[] = [];

function syncStyleTag(): void {
  if (typeof document === 'undefined') return;
  let element = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (instances.length === 0) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('style');
    element.id = STYLE_ID;
    document.head.appendChild(element);
  }
  const css = instances[instances.length - 1].css;
  if (element.textContent !== css) element.textContent = css;
}

/**
 * Injects the global CSS (web only; renders nothing). Nested providers share
 * one `<style>` tag (they differ at most in the focus-ring fallback color), and
 * the tag is removed only when the last instance unmounts — a nested provider
 * unmounting never strips the page's focus ring.
 */
export function UniversalCSS() {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web' && typeof document !== 'undefined';
  const focusRing = theme.states?.focusRing;
  const css = useMemo(
    () => (isWeb ? generateUniversalCSS({ focusRing }) : ''),
    [isWeb, focusRing]
  );

  useIsomorphicLayoutEffect(() => {
    if (!isWeb) return;
    const entry = { css };
    instances.push(entry);
    syncStyleTag();
    return () => {
      const index = instances.indexOf(entry);
      if (index >= 0) instances.splice(index, 1);
      syncStyleTag();
    };
  }, [isWeb, css]);

  return null;
}
