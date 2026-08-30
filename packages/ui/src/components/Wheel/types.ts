import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export type WheelValue = string | number;

export interface WheelItem<T extends WheelValue = WheelValue> {
  value: T;
  label?: ReactNode;
}

export interface WheelProps<T extends WheelValue = WheelValue>
  extends Omit<ViewProps, 'children'> {
  items: readonly WheelItem<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  onChangeComplete?: (value: T) => void;
  /** Accessible name for the wheel, such as "Hour". */
  label: string;
  width?: number;
  height?: number;
  itemHeight?: number;
  disabled?: boolean;
  /** Play a selection detent as each value crosses the center. */
  haptics?: boolean;
  style?: StyleProp<ViewStyle>;
}