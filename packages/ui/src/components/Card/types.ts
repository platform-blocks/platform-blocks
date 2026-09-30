import type React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { WebMouseEvent } from '../../core/platform/webProps';
import type { BorderRadiusProps } from '../../core/theme/radius';
import type { ShadowProps } from '../../core/theme/shadow';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import type { LayoutProps } from '../../core/utils/layout';

/**
 * Props for `Card`. Besides its own props, Card forwards every React Native
 * `View` prop (`role`, `aria-*`, `accessibilityLabel`, `onLayout`, …) to its root.
 */
export interface CardProps
  extends BaseProps<ViewStyle>,
    LayoutProps,
    BorderRadiusProps,
    ShadowProps,
    Omit<ViewProps, 'style' | 'testID' | 'children' | 'accessibilityRole' | 'accessibilityState'> {
  children?: React.ReactNode; // children optional to reduce noisy TS errors during composition
  /**
   * Visual variant. Each variant sets its own background + default shadow.
   * - `filled` (default) — surface background
   * - `outline` — transparent + border
   * - `elevated` — surface with a stronger shadow
   * - `subtle` — subtle background + soft border
   * - `ghost` — transparent until pressed
   * - `gradient` — primary-palette gradient overlay
   */
  variant?: 'outline' | 'filled' | 'elevated' | 'subtle' | 'ghost' | 'gradient';
  /**
   * Add a 1px border on top of *any* variant. Composes with
   * `variant="elevated"` etc. without forcing you into the `outline` variant.
   */
  withBorder?: boolean;
  /** Custom border color. When set, implies `withBorder` if `borderWidth` isn't 0. */
  borderColor?: string;
  /** Custom border width in px. Defaults to 1 when `withBorder` or `borderColor` is set. */
  borderWidth?: number;
  /** Layout of a card in a flex row or positioned board. */
  flex?: number;
  shrink?: number;
  position?: ViewStyle['position'];
  top?: ViewStyle['top'];
  left?: ViewStyle['left'];
  zIndex?: number;
  borderTopWidth?: number;
  borderTopColor?: string;
  borderStyle?: ViewStyle['borderStyle'];
  /**
   * Clip children to the card's radius. Turn this on when a `Card.Section`
   * carries full-bleed content (image, code surface) that would otherwise
   * square off the card's rounded corners. Off by default so overlays that
   * escape the card — menus, popovers, tooltips — keep working.
   */
  clip?: boolean;
  /**
   * Internal padding. Accepts a size token (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'`)
   * or a pixel number.
   */
  padding?: SizeValue;
  /** Makes the card a button (or the given `role`); it is focusable and activates with Enter/Space on web. */
  onPress?: () => void;
  /** Disables `onPress` and marks the card `aria-disabled`. */
  disabled?: boolean;
  /** Web-only: context-menu (right-click) handler. */
  onContextMenu?: (event: WebMouseEvent) => void;
}

/**
 * Props for `Card.Section` — a sub-region that opts out of the parent Card's
 * padding for full-bleed images, dividers, or banded sections.
 *
 * Position-aware: the parent Card walks its children and tags the first/last
 * sections so they only negate the relevant edges (a section in the middle
 * just escapes horizontal padding).
 */
export interface CardSectionProps extends Omit<ViewProps, 'style' | 'children'> {
  children?: React.ReactNode;
  /**
   * Adds a 1px theme border on the section. Top border appears when the
   * section is not the first child; bottom border when it's not the last.
   * Useful for creating banded rows separated by divider lines.
   */
  withBorder?: boolean;
  /**
   * Adds horizontal padding inside the section equal to the parent Card's
   * padding. Combine with the default full-bleed behaviour to align inner
   * content with the rest of the Card while keeping borders edge-to-edge.
   */
  inheritPadding?: boolean;
  /** Vertical padding inside the section (size token or pixel number). */
  py?: SizeValue;
  /** Horizontal padding inside the section (overrides `inheritPadding`). */
  px?: SizeValue;
  style?: ViewProps['style'];
  /** @internal — populated by the parent Card; do not set directly. */
  _isFirst?: boolean;
  /** @internal — populated by the parent Card; do not set directly. */
  _isLast?: boolean;
}

export type { PlocksTheme };
