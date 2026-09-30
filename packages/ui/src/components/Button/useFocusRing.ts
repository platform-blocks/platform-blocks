import { useCallback, useState } from 'react';
import type { ViewStyle } from 'react-native';

import { isWeb, webStyle } from '../../core/platform';
import type { PlocksTheme } from '../../core/theme/types';

interface FocusEventLike {
  target?: unknown;
  nativeEvent?: unknown;
}

interface MatchableElement {
  matches(selector: string): boolean;
}

function isMatchable(node: unknown): node is MatchableElement {
  return typeof node === 'object' && node !== null && typeof (node as MatchableElement).matches === 'function';
}

/** Whether focus arrived by keyboard (`:focus-visible`), not by pointer. */
function isFocusVisible(event: FocusEventLike | undefined): boolean {
  const nativeTarget =
    event?.nativeEvent && typeof event.nativeEvent === 'object'
      ? (event.nativeEvent as FocusEventLike).target
      : undefined;
  const target = nativeTarget ?? event?.target;
  if (!isMatchable(target)) return false;
  try {
    return target.matches(':focus-visible');
  } catch {
    // Engines without :focus-visible support: fall back to always showing it.
    return true;
  }
}

export interface FocusRing {
  /** Style for the focused element: the theme's focus ring while keyboard-focused (web), else `null`. */
  focusRingStyle: ViewStyle | null;
  onFocus: (event?: FocusEventLike) => void;
  onBlur: () => void;
}

/**
 * Keyboard focus ring for a control that draws its own focus state, in
 * `theme.states.focusRing`. Web only (native has no keyboard focus ring); pointer
 * focus never shows it. Mirrors the global `:focus-visible` ring UniversalCSS
 * injects, but follows the *nearest* theme rather than the root CSS variable.
 */
export function useFocusRing(theme: PlocksTheme): FocusRing {
  const [visible, setVisible] = useState(false);

  const onFocus = useCallback((event?: FocusEventLike) => {
    if (isWeb) setVisible(isFocusVisible(event));
  }, []);
  const onBlur = useCallback(() => {
    if (isWeb) setVisible(false);
  }, []);

  const focusRingStyle =
    visible && theme.states?.focusRing
      ? webStyle({ outlineStyle: 'solid', outlineWidth: 2, outlineOffset: 2, outlineColor: theme.states.focusRing })
      : null;

  return { focusRingStyle, onFocus, onBlur };
}
