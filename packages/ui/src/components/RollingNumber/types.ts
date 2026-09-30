import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { SizeValue } from '../../core/theme/sizes';
import type { SpacingProps } from '../../core/utils/spacing';

export type RollingNumberTimingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

/**
 * Which way the digit columns roll: `1` always up, `-1` always down, `0` each
 * digit straight to its new value. A function gets the previous and new value
 * and returns a number whose sign picks the direction.
 */
export type RollingNumberTrend = -1 | 0 | 1 | ((previous: number, value: number) => number);

export interface RollingNumberProps extends SpacingProps {
  /** Value to display. Each digit that changes rolls to its new position. */
  value: number;

  /** Static text rendered before the number (e.g. `"$ "`). */
  prefix?: string;
  /** Static text rendered after the number (e.g. `" USD"`). */
  suffix?: string;

  /** `true` for `,`, or an explicit separator string. */
  thousandSeparator?: boolean | string;
  /** Character between the integer and decimal parts. Default `.`. */
  decimalSeparator?: string;
  /** Number of decimal places to render. */
  decimalScale?: number;
  /** Pad the decimal part with zeros up to `decimalScale`. */
  fixedDecimalScale?: boolean;

  /**
   * Roll duration in ms. Default `600`. `0` — and an active reduced-motion
   * preference — snap straight to the new digits.
   */
  transitionDuration?: number;
  /** alias for `transitionDuration`. */
  animationDuration?: number;
  /** Easing curve for the roll. Default `ease`. */
  timingFunction?: RollingNumberTimingFunction;
  /**
   * Per-column delay in ms, applied right-to-left so the least significant
   * digit leads. Default `0` (all columns move together).
   */
  stagger?: number;
  /**
   * Which way the digits roll. By default they roll up when the number grows
   * and down when it shrinks, so 19 → 20 carries the ones column forward
   * 9 → 0 like an odometer. `1` or `-1` fix the direction, `0` moves each digit
   * straight to its new value, and a function decides per change.
   */
  trend?: RollingNumberTrend;
  /** Animate from zero on first render instead of appearing settled. Default `false`. */
  animateOnMount?: boolean;

  /** Font size token or explicit number. Default `'md'`. */
  size?: SizeValue;
  /** Text color. Accepts a text role (`'muted'`), palette syntax (`'primary.6'`) or any CSS color. */
  c?: string;
  /** Font weight. */
  fw?: TextStyle['fontWeight'] | 'normal' | 'medium' | 'semibold' | 'bold';
  /** Custom font family. */
  ff?: string;
  /**
   * Use tabular (fixed-width) figures so columns do not shift width as digits
   * change. Default `true`.
   */
  tabularNums?: boolean;

  /** Style for the row that wraps prefix, digits and suffix. */
  style?: StyleProp<ViewStyle>;
  /** Style applied to every glyph — digits, separators, prefix and suffix. */
  textStyle?: StyleProp<TextStyle>;
  /** Style applied to digit glyphs only. */
  digitStyle?: StyleProp<TextStyle>;

  /**
   * Screen-reader label. Defaults to the formatted value including prefix and
   * suffix, so the rolling columns never have to be read digit by digit.
   */
  accessibilityLabel?: string;
  testID?: string;
}
