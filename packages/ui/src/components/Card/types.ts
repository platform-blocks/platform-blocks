import React from 'react';
import type { AccessibilityRole, AccessibilityState } from 'react-native';
import type { PlatformBlocksTheme } from '../../core/theme';
import type { SizeValue } from '../../core/theme/sizes';
import { SpacingProps, LayoutProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import { ShadowProps } from '../../core/theme/shadow';

export interface CardProps extends SpacingProps, LayoutProps, BorderRadiusProps, ShadowProps {
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
  /**
   * Clip children to the card's radius. Turn this on when a `Card.Section`
   * carries full-bleed content (image, code surface) that would otherwise
   * square off the card's rounded corners. Off by default so overlays that
   * escape the card — menus, popovers, tooltips — keep working.
   */
  clip?: boolean;
  /**
   * Background color override. Accepts any CSS color string or a theme color
   * palette name (`'primary' | 'secondary' | 'gray' | 'success' | 'warning' | 'error'`),
   * which resolves to that palette's shade-1 (subtle tint).
   */
  bg?: string;
  /**
   * Internal padding. Accepts a size token (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'`)
   * or a pixel number.
   */
  padding?: SizeValue;
  style?: any;
  // Interactive props
  onPress?: () => void;
  disabled?: boolean;
  // Web-only events passthrough
  onContextMenu?: (e: any) => void;
  testID?: string;
  /**
   * Accessibility role forwarded to the underlying element. Pressable cards
   * default to a button; set `'link'` when the card navigates.
   */
  accessibilityRole?: AccessibilityRole;
  /** Accessibility label forwarded to the underlying element. */
  accessibilityLabel?: string;
  /**
   * Accessibility state forwarded to the underlying element. Required for the
   * selectable roles — a card with `accessibilityRole="radio"` or `"checkbox"`
   * has to announce its `checked` state or screen readers read every option as
   * unselected.
   */
  accessibilityState?: AccessibilityState;
}

/**
 * Props for `Card.Section` — a sub-region that opts out of the parent Card's
 * padding for full-bleed images, dividers, or banded sections.
 *
 * Position-aware: the parent Card walks its children and tags the first/last
 * sections so they only negate the relevant edges (a section in the middle
 * just escapes horizontal padding).
 */
export interface CardSectionProps {
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
  style?: any;
  /** @internal — populated by the parent Card; do not set directly. */
  _isFirst?: boolean;
  /** @internal — populated by the parent Card; do not set directly. */
  _isLast?: boolean;
}

export type { PlatformBlocksTheme };
