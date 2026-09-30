import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { SizeValue } from '../../core/theme/types';
import type { ThemeColor } from '../../core/theme/resolveColors';

export type LoaderVariant = 'bars' | 'dots' | 'oval';

export interface LoaderProps extends BaseProps<ViewStyle> {
  /** Size of the loader - can be a size token (the icon scale) or number */
  size?: SizeValue;
  /** Color of the loader: palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;
  /** Variant of the loader */
  variant?: LoaderVariant;
  /** Duration of one animation cycle in milliseconds */
  speed?: number;
  /**
   * Accessible name of the busy indicator (`role="progressbar"`, `aria-busy`).
   * @default 'Loading'
   */
  accessibilityLabel?: string;
}
