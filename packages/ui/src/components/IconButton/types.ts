import React from 'react';
import { SpacingProps, LayoutProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import { ShadowProps } from '../../core/theme/shadow';
import { SizeValue } from '../../core/theme/sizes';
import { TooltipProps, TooltipPropValue } from '../Tooltip';
import { IconProps, ExternalIconComponent } from '../Icon/types';

export interface IconButtonProps extends SpacingProps, LayoutProps, BorderRadiusProps, ShadowProps {
  /**
   * Icon to render. Accepts a registry name, or an external icon library
   * component/element (e.g. a Tabler icon) for use without registration.
   */
  icon: string | ExternalIconComponent | React.ReactElement;
  /** Called when the button is pressed */
  onPress?: () => void;
  /** Called when the button layout is calculated */
  onLayout?: (event: any) => void;
  /**
   * Button visual variant. `default` is the neutral surface-plus-hairline button,
   * matching `Button`; a solid primary fill is opt-in via `filled`.
   * @default 'default'
   */
  variant?: 'default' | 'filled' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'none';
  /** Button size */
  size?: SizeValue;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether button is in loading state (shows loader) */
  loading?: boolean;
  /**
   * Tint for the button. Accepts raw CSS color OR theme token syntax:
   *  - 'primary' (palette key -> uses middle shade 5)
   *  - 'primary.6' (palette key + shade index)
   *  - '#ff0000' / 'rgb(...)' direct colors
   *
   * `filled`, `secondary` and `outline` tint the container; `ghost` and the
   * neutral `default`/`none` keep their chrome and tint only the icon.
   * `gradient` draws its own overlay and ignores this.
   */
  color?: string;
  /**
   * Legacy alias for `color`, kept for back-compat. `color` wins when both are
   * set. Prefer `color` — it matches Button, Badge, Chip, and Card.
   */
  colorVariant?: string;
  /** Explicit icon color override (else derived automatically from variant & color) */
  iconColor?: string;
  /** Icon variant override */
  iconVariant?: IconProps['variant'];
  /** Icon size override (defaults to appropriate size for button size) */
  iconSize?: IconProps['size'];
  /**
   * Tooltip shown on hover/focus — wraps the button in a `Tooltip`.
   * Pass a string, or a config object (`{ label, maxWidth, withArrow, … }`) for
   * long labels that need a wider bubble.
   */
  tooltip?: TooltipPropValue;
  /** Tooltip position when the string form of `tooltip` is used */
  tooltipPosition?: TooltipProps['position'];
  /** Accessibility label - highly recommended for icon-only buttons */
  accessibilityLabel?: string;
  /**
   * Length of the press scale transition in ms. `0` applies the pressed state
   * instantly. Always 0 under reduced motion.
   * @default 100
   */
  transitionDuration?: number;
  /** Style overrides for the button container */
  style?: any;
  /** Test ID for testing */
  testID?: string;
}