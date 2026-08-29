import type { View, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';
import type { SpacingProps, LayoutProps } from '../../core/utils';
import type { SizeValue } from '../../core/theme/sizes';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { TooltipPropValue, TooltipProps } from '../Tooltip';
import type { TextProps } from '../Text';


/** Axis the bar fills along. Vertical bars fill from the bottom up. */
export type ProgressOrientation = 'horizontal' | 'vertical';

/** Placement of the label block relative to the bar. */
export type ProgressLabelPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Field-style label/description/error props, matching the input components
 * (`Checkbox`, `Switch`, `Slider`, `Rating`). The block renders *outside* the
 * track — for text drawn *inside* a filled section use `Progress.Label`.
 */
export interface ProgressFieldProps {
  /** Label rendered outside the track. Strings are styled; nodes render as-is. */
  label?: React.ReactNode;

  /** Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set. */
  description?: React.ReactNode;

  /** Error message rendered below the bar. Replaces `description` when present. */
  error?: React.ReactNode;

  /** Marks the field as required, rendering an asterisk beside the label. @default false */
  required?: boolean;

  /** Whether the required marker is drawn. @default true */
  withAsterisk?: boolean;

  /** Placement of the label block relative to the bar. @default 'top' */
  labelPosition?: ProgressLabelPosition;

  /** Gap between the label block and the bar — a theme size token or pixel value. @default 'xs' */
  labelGap?: SizeValue | number;

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
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface ProgressProps extends SpacingProps, LayoutProps, ProgressFieldProps {
  value: number; // 0-100
  size?: SizeValue;
  color?: ThemeColor;
  radius?: SizeValue;
  striped?: boolean;
  animate?: boolean;
  transitionDuration?: number; // ms
  /** Axis the bar fills along. Vertical bars fill bottom-up. @default 'horizontal' */
  orientation?: ProgressOrientation;
  /** Length along the main axis. Vertical bars default to 160. */
  length?: number | `${number}%`;
  /** Track (unfilled) color. Defaults to the theme's `gray[1]`. */
  trackColor?: string;
  /** Styles applied to the track. Spacing/layout props stay on the outermost element. */
  style?: StyleProp<ViewStyle>;
  'aria-label'?: string;
  testID?: string;
}

export interface ProgressSectionProps extends ProgressInteractionProps {
  value: number; // 0-100
  color?: ThemeColor;
  /** Diagonal stripe overlay, matching `Progress`'s `striped`. */
  striped?: boolean;
  /** Animates the stripes. Requires `striped`. */
  animate?: boolean;
  /** Animate size changes over this many ms. Inherited from `Progress.Root`. */
  transitionDuration?: number;
  /** Rounds this section's own corners. Sections are square by default. */
  radius?: SizeValue;
  /**
   * Tooltip shown on hover/focus/tap, rendered inside the section.
   * Prefer this over wrapping the section in `Tooltip` yourself: the wrapper
   * would become the flex item and collapse the section's percentage width.
   * Pass a string for the common case, or a config object to tune the tooltip:
   * `tooltip={{ label: 'Documents — 35%', position: 'bottom' }}`.
   */
  tooltip?: TooltipPropValue;
  /** Tooltip position when the string form of `tooltip` is used */
  tooltipPosition?: TooltipProps['position'];
  style?: StyleProp<ViewStyle>;
  'aria-label'?: string;
  testID?: string;
  children?: React.ReactNode;
}

export interface ProgressRootProps extends SpacingProps, LayoutProps, ProgressFieldProps {
  size?: SizeValue;
  radius?: SizeValue;
  /** Axis sections fill along. Vertical roots stack sections bottom-up. @default 'horizontal' */
  orientation?: ProgressOrientation;
  /** Length along the main axis. Vertical roots default to 160. */
  length?: number | `${number}%`;
  /** Track (unfilled) color. Defaults to the theme's `gray[1]`. */
  trackColor?: string;
  /** Default `transitionDuration` for child sections. */
  transitionDuration?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  'aria-label'?: string;
  testID?: string;
}

export interface ProgressLabelProps {
  children: React.ReactNode;
  /** Label color. Defaults to white so it reads on top of a filled section. */
  color?: string;
  size?: number;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export interface ProgressContextValue {
  orientation: ProgressOrientation;
  transitionDuration: number;
  /** Measured track length along the main axis, used to size stripe overlays. */
  trackExtent: number;
}

export interface ProgressFactoryPayload { props: ProgressProps; ref: View; }
export interface ProgressRootFactoryPayload { props: ProgressRootProps; ref: View; }
export interface ProgressSectionFactoryPayload { props: ProgressSectionProps; ref: View; }
export interface ProgressLabelFactoryPayload { props: ProgressLabelProps; ref: Text; }
