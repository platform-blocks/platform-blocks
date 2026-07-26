import { View, ViewStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/utils';
import { SizeValue } from '../../core/theme/sizes';
import type { DisclaimerSupport } from '../_internal/Disclaimer';
import type { ExternalIconComponent } from '../Icon/types';

/**
 * Anything that can stand in for the default star: a registry icon name
 * (`'heart'`), an icon library component, or a ready-made element.
 */
export type RatingIcon = string | ExternalIconComponent | React.ReactElement;

export interface RatingProps extends SpacingProps, DisclaimerSupport {
  /** Current rating value */
  value?: number;

  /**
   * Initial rating value for uncontrolled component
   * @default 0
   */
  defaultValue?: number;

  /**
   * Number of rating items (stars) to render
   * @default 5
   */
  count?: number;

  /**
   * Disables input — the rating only displays its value
   * @default false
   */
  readOnly?: boolean;

  /**
   * Disables the rating. Like `readOnly` it blocks input, but it also dims the
   * control and reports a disabled state to assistive technology.
   * @default false
   */
  disabled?: boolean;

  /**
   * Allows partial values so a star can be filled fractionally
   * @default false
   */
  allowFraction?: boolean;

  /**
   * Smallest increment a value is rounded to when `allowFraction` is enabled.
   * Clamped to the `0.01`–`1` range.
   * @default 0.1 when `allowFraction`, otherwise 1
   */
  precision?: number;

  /**
   * Size of each rating item — a theme size token or an explicit pixel size
   * @default 'md'
   */
  size?: SizeValue | number;

  /** Color of filled items. Defaults to the theme warning color. */
  color?: string;

  /** Color of empty items. Defaults to the theme gray color. */
  emptyColor?: string;

  /** Color of items while hovering/dragging. Defaults to a darker theme warning color. */
  hoverColor?: string;

  /** Called with the new value when the rating changes */
  onChange?: (value: number) => void;

  /** Called with the previewed value while hovering (web only) */
  onHover?: (value: number) => void;

  /**
   * Allows clearing the rating by selecting the value that is already set
   * @default false
   */
  clearable?: boolean;

  /**
   * Marks the field as required. Renders an asterisk beside the label and
   * reports the requirement to assistive technology on web.
   * @default false
   */
  required?: boolean;

  /** Error message rendered below the rating */
  error?: React.ReactNode;

  /** Helper text rendered below the rating */
  description?: React.ReactNode;

  /**
   * Shows a tooltip with the current value out of `count` while hovering
   * @default false
   */
  showTooltip?: boolean;

  /**
   * Formats the tooltip text. Receives the previewed value and `count`;
   * defaults to `4.5 / 5`.
   */
  getTooltipLabel?: (value: number, count: number) => string;

  /**
   * Icon rendered for each item instead of the default star. Accepts an icon
   * registry name (`'heart'`), an icon library component, or an element.
   * Takes precedence over `character`.
   */
  icon?: RatingIcon;

  /**
   * Icon rendered for empty items. Defaults to `icon`, so the same glyph is
   * drawn in `emptyColor` unless a different empty icon is supplied.
   */
  emptyIcon?: RatingIcon;

  /**
   * Character or node rendered for filled items. Custom strings render as text
   * glyphs, a React element is cloned with `size` and `color`, and the default
   * star character renders the built-in star icon. Ignored when `icon` is set.
   * @default '★'
   */
  character?: string | React.ReactNode;

  /**
   * Character or node rendered for empty items. Ignored when `icon` or
   * `emptyIcon` is set.
   * @default '☆'
   */
  emptyCharacter?: string | React.ReactNode;

  /**
   * Spacing between rating items — a theme size token or an explicit pixel value
   * @default 'xs'
   */
  gap?: SizeValue | number;

  /** Additional styles applied to the root element */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;

  /** Custom accessibility label. Defaults to `Rating: {value} out of {count} stars`. */
  accessibilityLabel?: string;

  /** Custom accessibility hint. Defaults to an adjust hint unless `readOnly`. */
  accessibilityHint?: string;

  /** Label rendered next to the rating. Strings are wrapped in a secondary `Text`. */
  label?: React.ReactNode;

  /**
   * Placement of the label relative to the rating
   * @default 'above'
   */
  labelPosition?: 'left' | 'right' | 'above' | 'below';

  /**
   * Spacing between the label and the rating — a theme size token or pixel value
   * @default 'xs'
   */
  labelGap?: SizeValue | number;
}

export interface RatingFactoryPayload {
  props: RatingProps;
  ref: View;
}
