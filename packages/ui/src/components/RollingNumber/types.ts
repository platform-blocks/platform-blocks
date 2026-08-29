import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { SizeValue } from '../../core/theme/sizes';
import type { SpacingProps } from '../../core/utils';

export type RollingNumberTimingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

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
  /** Animate from zero on first render instead of appearing settled. Default `false`. */
  animateOnMount?: boolean;

  /** Font size token or explicit number. Default `'md'`. */
  size?: SizeValue;
  /** Text color. Accepts theme palette syntax (`'primary.6'`, `'dimmed'`) or any CSS color. */
  color?: string;
  /** Shorthand alias for `color`, resolved identically. `color` wins when both are set. */
  c?: string;
  /** Font weight. */
  weight?: TextStyle['fontWeight'] | 'normal' | 'medium' | 'semibold' | 'bold';
  /** Custom font family. */
  fontFamily?: string;
  /** Shorthand alias for `fontFamily`. */
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
