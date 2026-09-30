import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

import type { BaseProps } from '../../core/types/base';

export type WheelValue = string | number;

export interface WheelItem<T extends WheelValue = WheelValue> {
  value: T;
  label?: ReactNode;
}

export interface WheelProps<T extends WheelValue = WheelValue>
  extends BaseProps,
    Omit<ViewProps, 'children' | 'style' | 'testID'> {
  items: readonly WheelItem<T>[];
  /** Selected value (controlled). */
  value?: T;
  /** Initially selected value (uncontrolled). Default: the first item. */
  defaultValue?: T;
  /** Called with each value that crosses the center (during a spin, a tap, or a key press). */
  onChange?: (value: T) => void;
  /** Called once the wheel settles on a value. */
  onChangeComplete?: (value: T) => void;
  /** Accessible name for the wheel, such as "Hour". */
  label: string;
  /** Column height in px; the selected item sits in its middle. @default 200 */
  h?: number;
  itemHeight?: number;
  disabled?: boolean;
  /** Play a selection detent as each value crosses the center. */
  haptics?: boolean;
}
