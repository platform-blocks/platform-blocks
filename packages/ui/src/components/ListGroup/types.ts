import type React from 'react';
import type { ViewProps, ViewStyle, TextStyle, StyleProp } from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

export interface ListGroupMetrics {
  paddingVertical: number;
  paddingHorizontal: number;
  gap: number;
  dividerInset: number;
  textSize: ComponentSizeValue;
}

type ListGroupHostProps = Omit<ViewProps, 'children' | 'style' | 'testID'>;

export interface ListGroupProps extends BaseProps<ViewStyle>, ListGroupHostProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'flush';
  size?: ComponentSizeValue;
  /** Corner radius: theme radius token, px, `'none'` or `'full'`. */
  radius?: RadiusValue;
  dividers?: boolean;
  insetDividers?: boolean;
}

export interface ListGroupItemProps extends BaseProps<ViewStyle>, ListGroupHostProps {
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
  /** Applied to the single-line `children` text and to `label`. */
  textStyle?: StyleProp<TextStyle>;
  /** Applied to the `description` text. */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Truncate `label`/`description` to this many lines instead of wrapping. */
  numberOfLines?: number;
}

export interface ListGroupDividerProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Indent the divider from the leading edge. Defaults to the group's `insetDividers`. */
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ListGroupContextValue {
  size: ComponentSizeValue;
  metrics: ListGroupMetrics;
  dividers: boolean;
  insetDividers: boolean;
}
