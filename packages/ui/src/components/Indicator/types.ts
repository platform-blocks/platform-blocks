import type { ViewStyle, StyleProp } from 'react-native';
import type { SizeValue } from '../../core/theme/types';
import type { TextProps } from '../Text';

export interface IndicatorProps {
  size?: SizeValue | number;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offset?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * Free-form content rendered inside the indicator dot. Useful when a custom
   * icon is needed; for plain text counts prefer `label`, which auto-resizes
   * the dot and applies a contrast-aware text color.
   */
  children?: React.ReactNode;
  /**
   * Convenience text content (typically a count). When set, the dot expands to
   * fit the label and the text uses a contrast-aware color.
   */
  label?: React.ReactNode;
  /** Override props applied to the label `<Text>` (style, weight, ff, size, color). */
  labelProps?: Omit<TextProps, 'children'>;
  invisible?: boolean;
}
