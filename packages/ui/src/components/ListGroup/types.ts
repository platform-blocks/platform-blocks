import type { ViewStyle, TextStyle, StyleProp } from 'react-native';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

export interface ListGroupMetrics {
  paddingVertical: number;
  paddingHorizontal: number;
  gap: number;
  dividerInset: number;
  textSize: ComponentSizeValue;
}

export interface ListGroupProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'flush';
  size?: ComponentSizeValue;
  radius?: 'sm' | 'md' | 'lg' | number;
  dividers?: boolean;
  insetDividers?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ListGroupItemProps {
  /**
   * Single-line row content. Rendered inside the item's own `<Text>`, so it
   * takes strings and inline text — not a layout block. For a two-line row use
   * `label` + `description` instead.
   */
  children?: React.ReactNode;

  /**
   * Primary line of a two-line row. Takes precedence over `children`, which is
   * ignored when this is set.
   */
  label?: React.ReactNode;
  /** Muted secondary line beneath `label`. */
  description?: React.ReactNode;
  /** Muted trailing text, rendered before `endSection`. */
  value?: React.ReactNode;

  onPress?: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  startSection?: React.ReactNode;
  endSection?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Applied to the single-line `children` text and to `label`. */
  textStyle?: StyleProp<TextStyle>;
  /** Applied to the `description` text. */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Truncate `label`/`description` to this many lines instead of wrapping. */
  numberOfLines?: number;
}

export interface ListGroupContextValue {
  size: ComponentSizeValue;
  metrics: ListGroupMetrics;
  dividers: boolean;
  insetDividers: boolean;
}
