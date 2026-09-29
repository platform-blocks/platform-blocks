import type React from 'react';
import type { LayoutChangeEvent, PressableProps, ViewStyle } from 'react-native';

import type { BorderRadiusProps } from '../../core/theme/radius';
import type { ShadowProps } from '../../core/theme/shadow';
import type { SizeValue } from '../../core/theme/sizes';
import type { BaseProps, ColorProp, PassthroughAccessibilityProps } from '../../core/types/base';
import type { LayoutProps } from '../../core/utils/layout';
import type { TextProps } from '../Text';
import type { TooltipProps, TooltipPropValue } from '../Tooltip';

export type ButtonVariant =
  | 'default'
  | 'filled'
  | 'light'
  | 'subtle'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'gradient'
  | 'link'
  | 'none';

/** Moved to `core/types/base`; re-exported here so both import paths work. */
export type { PassthroughAccessibilityProps };

/**
 * Accessibility props passed straight through to the Button's Pressable
 * (`role`, `aria-*`, `accessibilityActions`, …); the name and hint are
 * Button's own `accessibilityLabel` / `accessibilityHint` props.
 */
export type ButtonAccessibilityProps = Omit<PassthroughAccessibilityProps, 'accessibilityLabel' | 'accessibilityHint'>;

export interface ButtonProps
  extends BaseProps<ViewStyle>,
    LayoutProps,
    BorderRadiusProps,
    ShadowProps,
    ButtonAccessibilityProps,
    Pick<PressableProps, 'hitSlop' | 'delayLongPress' | 'onFocus' | 'onBlur' | 'nativeID'> {
  /** Button text content - can be provided via title prop or children */
  title?: string;
  /** Button text content - alternative to title prop */
  children?: React.ReactNode;
  /** Called when the button is pressed */
  onPress?: () => void;
  /** Called when the button press starts (for immediate feedback) */
  onPressIn?: () => void;
  /** Called when the button press ends */
  onPressOut?: () => void;
  /** Called when the button is hovered (web/desktop only) */
  onHoverIn?: () => void;
  /** Called when the button is no longer hovered (web/desktop only) */
  onHoverOut?: () => void;
  /** Called when the button is long-pressed */
  onLongPress?: () => void;
  /** Called when the button layout is calculated */
  onLayout?: (event: LayoutChangeEvent) => void;
  /**
   * Button visual variant.
   *
   * `default` is a neutral button — a recessed fill with a visible border and
   * body text — so an unstyled `<Button>` never claims the accent color. A solid
   * primary fill is opt-in via `filled`.
   * @default 'default'
   */
  variant?: ButtonVariant;
  /**
   * Theme color the button is tinted with. A palette token (`primary`, `success`,
   * `error`, …), `'primary.6'` shade syntax, or any raw CSS/hex color. Applies to
   * the color-bearing variants (`filled`, `light`, `subtle`, `outline`, `gradient`)
   * and to the text of `ghost`/`link`. Defaults to `primary`. `secondary` stays
   * neutral by design.
   */
  color?: ColorProp;
  /** Button size: a size token, or a number (the control height in px). */
  size?: SizeValue;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether button is in loading state (shows loader, sets `aria-busy`) */
  loading?: boolean;
  /** Text to show when loading (if not provided, shows empty text but maintains original width) */
  loadingTitle?: string;
  /**
   * Whether button should fill the full width of its parent container. Buttons
   * size to their content by default; `fullWidth`, an explicit `w`, or a flex
   * value in `style` makes them fill instead.
   */
  fullWidth?: boolean;
  /** Explicit text color override (else derived automatically from variant & color) */
  textColor?: ColorProp;
  /**
   * Icon to show in the center (for icon-only buttons). Icon-only buttons need an
   * accessible name: pass `accessibilityLabel`, or a `tooltip` (used as the name).
   */
  icon?: React.ReactNode;
  /** Content (usually an icon) before the label. */
  startSection?: React.ReactNode;
  /** Content (usually an icon) after the label. */
  endSection?: React.ReactNode;
  /** @deprecated Use `startSection`. */
  startIcon?: React.ReactNode;
  /** @deprecated Use `endSection`. */
  endIcon?: React.ReactNode;
  /**
   * Tooltip shown on hover/focus — wraps the button in a `Tooltip`.
   * Pass a string for the common case, or a config object to tune the tooltip:
   * `tooltip={{ label: 'Long explanation…', maw: 320, withArrow: true }}`.
   * For an icon-only button without `accessibilityLabel`, the tooltip text is
   * also the button's accessible name.
   */
  tooltip?: TooltipPropValue;
  /** Tooltip position when the string form of `tooltip` is used */
  tooltipPosition?: TooltipProps['position'];
  /**
   * Length of the press / pulse / hover transitions in ms. `0` applies each
   * state instantly (no scale animation). Always 0 under reduced motion.
   * @default 110
   */
  transitionDuration?: number;
  /**
   * Accessible name. Defaults to the button's text; icon-only buttons fall back
   * to the tooltip text.
   */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers (native) */
  accessibilityHint?: string;
  /** Override props applied to the inner label `<Text>` (style, weight, ff, size, color). */
  labelProps?: Omit<TextProps, 'children'>;
}
