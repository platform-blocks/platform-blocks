import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { BorderRadiusProps } from '../../core/theme/radius';
import type { SizeValue } from '../../core/theme/sizes';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { LayoutProps } from '../../core/utils/layout';

export interface SegmentedControlItem {
  /** Unique value returned in change events */
  value: string;
  /** Item label, string will be rendered with Text component */
  label: ReactNode;
  /** Disable this specific segment */
  disabled?: boolean;
  /** Screen reader label override (required when `label` isn't a string) */
  ariaLabel?: string;
  /** Optional test identifier for automation */
  testID?: string;
}

export type SegmentedControlData = string | SegmentedControlItem;

export interface SegmentedControlProps extends BaseProps<ViewStyle>, LayoutProps, BorderRadiusProps {
  /** Data that defines the segments */
  data: SegmentedControlData[];
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Control size, maps to height and font size */
  size?: SizeValue;
  /** Indicator color: palette token, `'primary.6'` shade syntax, or CSS color */
  color?: ColorProp;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Stretch across available width */
  fullWidth?: boolean;
  /** Disable entire control */
  disabled?: boolean;
  /** Prevent user interaction but keep visual state */
  readOnly?: boolean;
  /** Adjust text color automatically for filled/outline variants */
  autoContrast?: boolean;
  /** Render dividers between items */
  withItemsBorders?: boolean;
  /** Indicator transition duration (ms) */
  transitionDuration?: number;
  /** Indicator transition easing */
  transitionTimingFunction?: string;
  /** Radio group name; also the group's accessible name when there is no label */
  name?: string;
  /** Visual style variant */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Custom style for indicator */
  indicatorStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to every item */
  itemStyle?: StyleProp<ViewStyle>;
  /** Accessibility label for the entire control */
  accessibilityLabel?: string;
  /** Optional label rendered alongside the control */
  label?: ReactNode;
  /** Supplementary description text rendered with the label */
  description?: ReactNode;
  /** Placement of the label relative to the control (`left` / `right` follow the reading direction) */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
}
