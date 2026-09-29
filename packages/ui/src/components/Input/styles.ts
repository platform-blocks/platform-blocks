import { StyleSheet, type ViewStyle } from 'react-native';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { isWeb } from '../../core/platform';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';

/**
 * Width floor for a field on wide screens. Fields dropped into a shrinking
 * flex parent (a row, a form grid) otherwise collapse to something too narrow
 * to type in; mobile skips the floor entirely and just fills the row, since
 * 400px is wider than the viewport.
 *
 * The floor is clamped to the parent so it can never push the field past it —
 * a field inside a narrow panel (a 420px sign-in card) would otherwise overflow
 * the panel's own padding, since `min-width` outranks both `width` and
 * `max-width`. Web gets the clamp via CSS `min()`; Yoga has no equivalent, so
 * native keeps the plain floor.
 */
export const INPUT_MIN_WIDTH = 400;

export const inputMinWidthFloor = (): ViewStyle =>
  (isWeb
    ? { minWidth: `min(100%, ${INPUT_MIN_WIDTH}px)` as unknown as number }
    : { minWidth: INPUT_MIN_WIDTH });

/**
 * Root (outer) style of a text field: full width, the desktop width floor and
 * the gap below the field. Cached per theme + `isMobile`.
 */
export const getInputRootStyles = createThemedStyles((theme: PlatformBlocksTheme, isMobile: boolean) =>
  StyleSheet.create({
    root: {
      marginBottom: resolveSpacing(theme, 'sm') as number,
      width: '100%',
      ...(isMobile ? null : inputMinWidthFloor()),
    },
    // A caller who sizes the field explicitly outranks the width floor —
    // `minWidth` beats both `width` and `maxWidth`, so it is dropped rather
    // than merely overridden.
    unfloored: { minWidth: 0 },
  })
);
