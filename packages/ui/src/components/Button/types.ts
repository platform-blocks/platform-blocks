import React from 'react';
import { SpacingProps, LayoutProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import { ShadowProps } from '../../core/theme/shadow';
import { SizeValue } from '../../core/theme/sizes';
import { TooltipProps, TooltipPropValue } from '../Tooltip';
import type { TextProps } from '../Text';

export interface ButtonProps extends SpacingProps, LayoutProps, BorderRadiusProps, ShadowProps {
  key?: React.Key; // allow React key without complaint in TS where JSX key is forwarded in type checking
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
  onLayout?: (event: any) => void;
  /**
   * Button visual variant.
   *
   * `default` is a neutral button — the card surface with a hairline border and
   * body text — so an unstyled `<Button>` never claims the accent color. A solid
   * primary fill is opt-in via `filled`.
   * @default 'default'
   */
  variant?: 'default' | 'filled' | 'light' | 'subtle' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'link' | 'none';
  /**
   * Theme color the button is tinted with. A palette token (`primary`, `success`,
   * `error`, …) or any raw CSS/hex color. Applies to the color-bearing variants
   * (`filled`, `light`, `subtle`, `outline`, `gradient`) and to the text of
   * `ghost`/`link`. Defaults to `primary`. `secondary` stays neutral by design.
   */
  color?: string;
  /** Button size */
  size?: SizeValue;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether button is in loading state (shows loader) */
  loading?: boolean;
  /** Text to show when loading (if not provided, shows empty text but maintains original width) */
  loadingTitle?: string;
  /**
   * Whether button should fill the full width of its parent container. Buttons
   * size to their content by default; `fullWidth`, an explicit `w`, or a flex
   * value in `style` makes them fill instead.
   */
  fullWidth?: boolean;
  /**
   * Custom color override for the button. Accepts raw CSS color OR theme token syntax:
   *  - 'primary' (palette key -> uses middle shade 5)
   *  - 'primary.6' (palette key + shade index)
   *  - '#ff0000' / 'rgb(...)' direct colors
   * Named colorVariant to align with Text component API.
   */
  colorVariant?: string;
  /** Explicit text color override (else derived automatically from variant & color) */
  textColor?: string;
  /** Icon to show in the center (for icon-only buttons) */
  icon?: React.ReactNode;
  /** Icon to show on the left side of the button */
  startIcon?: React.ReactNode;
  /** Icon to show on the right side of the button */
  endIcon?: React.ReactNode;
  /**
   * Tooltip shown on hover/focus — wraps the button in a `Tooltip`.
   * Pass a string for the common case, or a config object to tune the tooltip:
   * `tooltip={{ label: 'Long explanation…', maxWidth: 320, withArrow: true }}`.
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
  /** Style overrides for the button container */
  style?: any;
  /** Test ID for testing library queries */
  testID?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
  /** Override props applied to the inner label `<Text>` (style, weight, ff, size, colorVariant). */
  labelProps?: Omit<TextProps, 'children'>;
}