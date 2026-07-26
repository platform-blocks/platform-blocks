import type React from 'react';
import type { StyleProp, ViewStyle, ViewProps } from 'react-native';

import type { SurfaceLevel } from '../../core/theme/types';
import type { SizeValue } from '../../core/theme/sizes';
import type { ShadowProps } from '../../core/theme/shadow';
import type { BorderRadiusProps } from '../../core/theme/radius';
import type { SpacingProps, LayoutProps } from '../../core/utils';

export type { SurfaceLevel };

export interface SurfaceProps
  extends SpacingProps,
    LayoutProps,
    BorderRadiusProps,
    ShadowProps,
    Omit<ViewProps, 'style'> {
  children?: React.ReactNode;

  /**
   * Elevation step (`0`–`3`). Drives background, border color and the default
   * shadow together, so a surface can't end up with a level-3 shadow over a
   * level-0 fill.
   *
   * Omit it to derive the level from the enclosing Surface — see `raised`.
   */
  level?: SurfaceLevel;

  /**
   * Take the enclosing Surface's level and add one (clamped at 3). This is what
   * makes nesting work: a popover inside a card lands a step above the card
   * without either one hard-coding a number.
   */
  raised?: boolean;

  /**
   * Show the level's hairline border. Defaults to `'auto'`, which draws it only
   * in dark mode — light mode conveys elevation with shadow, dark mode can't.
   */
  withBorder?: boolean | 'auto';

  /** Border color override. Implies a border. */
  borderColor?: string;
  /** Border width override in px. Implies a border. */
  borderWidth?: number;

  /**
   * Background override — CSS color, a `theme.backgrounds` key, or a palette
   * name/`palette.shade`. Wins over the level's fill.
   */
  bg?: string;

  /** Internal padding — size token or px. Surfaces have none by default. */
  padding?: SizeValue;

  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface SurfaceContextValue {
  /** The level of the nearest enclosing Surface. */
  level: SurfaceLevel;
}
