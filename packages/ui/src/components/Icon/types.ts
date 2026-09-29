import type React from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/sizes';
import type { BaseProps, ColorProp } from '../../core/types/base';

export type IconSize = SizeValue;
export type IconVariant = 'filled' | 'outlined';

/** Props a component-based icon (e.g. a Tabler icon) is expected to accept. */
export interface ExternalIconProps {
  size?: number | string;
  color?: ColorValue;
  strokeWidth?: number | string;
  style?: StyleProp<ViewStyle>;
  /** Icon libraries take extra SVG props; they are passed through untouched. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- must accept any icon library's props (Tabler, lucide, vector-icons…).
  [key: string]: any;
}

export type ExternalIconComponent = React.ComponentType<ExternalIconProps>;

/** Props a legacy registry `content` component receives. */
export interface LegacyIconComponentProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  stroke?: number;
}

export interface IconDefinition {
  /**
   * SVG path data or React component (legacy hand-drawn icons).
   * Optional when the icon is provided via `outlined`/`filled` components.
   */
  content?: string | React.ComponentType<LegacyIconComponentProps>;
  /** Component-based outlined icon (e.g. Tabler `IconChevronRight`). */
  outlined?: ExternalIconComponent;
  /** Component-based filled icon (e.g. Tabler `IconStarFilled`). */
  filled?: ExternalIconComponent;
  /** Default viewBox for the icon */
  viewBox?: string;
  /** Whether this is a filled or outlined icon */
  variant?: IconVariant;
  /** Keep stroke visible even when rendered as filled */
  preserveStrokeOnFill?: boolean;
  /** Human-readable description used in docs and tooling */
  description?: string;
  /** Optional keywords to help search/filter docs */
  keywords?: string[];
}

export type IconRegistry = Record<string, IconDefinition>;

export interface IconProps extends BaseProps<ViewStyle> {
  /** Icon name from the registry */
  name?: string;
  /**
   * An external icon library component or element, rendered instead of `name`.
   * Enables using any icon library (e.g. Tabler) without registry registration.
   */
  icon?: ExternalIconComponent | React.ReactElement;
  /** Size token or px. */
  size?: IconSize;
  /** Icon color: palette token (`'primary'`, `'error.6'`) or any CSS color. Defaults to `theme.text.primary`. */
  color?: ColorProp;
  /** Stroke thickness for outlined icons. Defaults to 1.5. */
  stroke?: number;
  /** Icon variant - overrides the default variant from icon definition */
  variant?: IconVariant;
  /**
   * Accessible name. An icon with a name is announced as an image; without one
   * it is decorative (hidden from assistive technology).
   */
  label?: string;
  /** Alias of `label`. */
  accessibilityLabel?: string;
  /** Alias of `label` (the icon's title). */
  title?: string;
  /**
   * Hide the icon from assistive technology. Defaults to `true` unless the icon
   * has an accessible name (`label` / `accessibilityLabel` / `title`), so icons
   * inside labelled controls never add noise to what a screen reader announces.
   */
  decorative?: boolean;
  /** Whether to mirror this icon in RTL mode. If not specified, uses auto-detection based on icon name */
  mirrorInRTL?: boolean;
}
