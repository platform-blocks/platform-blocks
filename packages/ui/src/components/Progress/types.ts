import type React from 'react';
import type { View, Text, ViewStyle, TextStyle } from 'react-native';
import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { LayoutProps } from '../../core/utils/layout';
import type { SizeValue } from '../../core/theme/types';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { WebMouseEvent } from '../../core/platform/webProps';
import type { TooltipPropValue } from '../Tooltip';
import type { TextProps } from '../Text';


/** Axis the bar fills along. Vertical bars fill from the bottom up. */
export type ProgressOrientation = 'horizontal' | 'vertical';

/** Placement of the label block relative to the bar. */
export type ProgressLabelPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Field-style label/description/error props, matching the input components
 * (`Checkbox`, `Switch`, `Slider`, `Rating`). The block renders *outside* the
 * track — for text drawn *inside* a filled section use `Progress.Label`.
 *
 * The label names the progress bar for assistive technology (web:
 * `aria-labelledby`; native: its text), and the description / error describe it.
 */
export interface ProgressFieldProps {
  /** Label rendered outside the track. Strings are styled; nodes render as-is. */
  label?: React.ReactNode;

  /** Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set. */
  description?: React.ReactNode;

  /** Error message rendered below the bar (announced politely). Replaces `description` when present. */
  error?: React.ReactNode;

  /** Marks the field as required, rendering an asterisk beside the label. @default false */
  required?: boolean;

  /** Whether the required marker is drawn. @default true */
  withAsterisk?: boolean;

  /** Placement of the label block relative to the bar. @default 'top' */
  labelPosition?: ProgressLabelPosition;

  /** Gap between the label block and the bar — a theme spacing token or pixel value. @default 'xs' */
  labelGap?: SizeValue;

  /** Override props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;
}

/**
 * Handlers forwarded to the underlying view so wrappers such as `Tooltip`
 * (which clones its child with hover/press handlers) can drive a section.
 */
export interface ProgressInteractionProps {
  onPress?: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  /** Web only. Forwarded for wrappers (e.g. `Tooltip`) that attach mouse handlers; prefer `onHoverIn`. */
  onMouseEnter?: (event: WebMouseEvent) => void;
  /** Web only. Forwarded for wrappers (e.g. `Tooltip`) that attach mouse handlers; prefer `onHoverOut`. */
  onMouseLeave?: (event: WebMouseEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface ProgressProps extends BaseProps<ViewStyle>, LayoutProps, ProgressFieldProps {
  /** Completion, 0–100 (clamped). */
  value: number;
  /** Bar thickness: a control-size token (`getControlSize(theme, size).height`) or pixels. @default 'md' */
  size?: SizeValue;
  /** Fill color: palette token, `'primary.6'` shade syntax, or any CSS color. @default 'primary' */
  color?: ThemeColor;
  /** Corner radius: theme radius token, px, `'none'` or `'full'`. @default 'md' */
  radius?: RadiusValue;
  striped?: boolean;
  /** Animates the stripes. Requires `striped`. Off while reduced motion is on. */
  animate?: boolean;
  /** Animate fill changes over this many ms. `0` (and reduced motion) jumps straight to the value. @default 0 */
  transitionDuration?: number;
  /** Axis the bar fills along. Vertical bars fill bottom-up. @default 'horizontal' */
  orientation?: ProgressOrientation;
  /** Length along the main axis. Vertical bars default to 160. */
  length?: number | `${number}%`;
  /** Track (unfilled) color. Defaults to the theme's `backgrounds.border`. */
  trackColor?: string;
  /** Accessible name. Defaults to the `label` (web: by reference). */
  'aria-label'?: string;
  /** Spoken value text, e.g. `"3 of 8 files"`. Defaults to the percentage. */
  'aria-valuetext'?: string;
}

export interface ProgressSectionProps extends BaseProps<ViewStyle>, ProgressInteractionProps {
  /** This section's share of the track, 0–100 (clamped). */
  value: number;
  color?: ThemeColor;
  /** Diagonal stripe overlay, matching `Progress`'s `striped`. */
  striped?: boolean;
  /** Animates the stripes. Requires `striped`. Off while reduced motion is on. */
  animate?: boolean;
  /** Animate size changes over this many ms. Inherited from `Progress.Root`. */
  transitionDuration?: number;
  /** Rounds this section's own corners. Sections are square by default. */
  radius?: RadiusValue;
  /**
   * Tooltip shown on hover/focus/tap, rendered inside the section.
   * Prefer this over wrapping the section in `Tooltip` yourself: the wrapper
   * would become the flex item and collapse the section's percentage width.
   * Pass a string for the common case, or a config object to tune the tooltip:
   * `tooltip={{ label: 'Documents — 35%', position: 'bottom' }}`.
   */
  tooltip?: TooltipPropValue;
  /** Accessible name. Defaults to the tooltip text. */
  'aria-label'?: string;
  /** Spoken value text. Defaults to the percentage. */
  'aria-valuetext'?: string;
  children?: React.ReactNode;
}

export interface ProgressRootProps extends BaseProps<ViewStyle>, LayoutProps, ProgressFieldProps {
  /** Bar thickness: a control-size token or pixels. @default 'md' */
  size?: SizeValue;
  /** Corner radius of the track. @default 'md' */
  radius?: RadiusValue;
  /** Axis sections fill along. Vertical roots stack sections bottom-up. @default 'horizontal' */
  orientation?: ProgressOrientation;
  /** Length along the main axis. Vertical roots default to 160. */
  length?: number | `${number}%`;
  /** Track (unfilled) color. Defaults to the theme's `backgrounds.border`. */
  trackColor?: string;
  /** Default `transitionDuration` for child sections. */
  transitionDuration?: number;
  children: React.ReactNode;
  /** Accessible name of the group of sections. Defaults to the `label`. */
  'aria-label'?: string;
}

export interface ProgressLabelProps extends BaseProps<TextStyle> {
  children: React.ReactNode;
  /** Label color. Defaults to a color readable on the enclosing section's fill. */
  color?: string;
  /** Font size token or px. @default 'sm' */
  size?: SizeValue;
  numberOfLines?: number;
}

export interface ProgressContextValue {
  orientation: ProgressOrientation;
  /** Default fill transition for sections (already 0 under reduced motion). */
  transitionDuration: number;
  /** Measured track length along the main axis, used to size stripe overlays. */
  trackExtent: number;
}

export interface ProgressFactoryPayload { props: ProgressProps; ref: View; }
export interface ProgressRootFactoryPayload { props: ProgressRootProps; ref: View; }
export interface ProgressSectionFactoryPayload { props: ProgressSectionProps; ref: View; }
export interface ProgressLabelFactoryPayload { props: ProgressLabelProps; ref: Text; }
