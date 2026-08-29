import { ComponentProps } from 'react';
import { View } from 'react-native';
import { SpacingProps, LayoutProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import { SizeValue } from '../../core/theme/sizes';
import type { DisclaimerSupport } from '../_internal/Disclaimer';

export interface ToggleButtonProps extends SpacingProps, LayoutProps, BorderRadiusProps {
  /** Value for this toggle button */
  value: string | number;
  /** Whether this button is selected */
  selected?: boolean;
  /** Callback when button is pressed */
  onPress?: (value: string | number) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Size of the toggle button */
  size?: SizeValue;
  /** Button color. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: string;
  /** Visual style variant */
  variant?: 'solid' | 'ghost';
  /** Custom styles */
  style?: any;
  /** Test ID for testing */
  testID?: string;
}

export interface ToggleGroupProps extends SpacingProps, LayoutProps, BorderRadiusProps, DisclaimerSupport {
  /** Current selected value(s) */
  value?: string | number | (string | number)[];
  /** Initial value(s) for uncontrolled usage */
  defaultValue?: string | number | (string | number)[];
  /** Callback when selection changes */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** Whether only one option can be selected at a time */
  exclusive?: boolean;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Size of all toggle buttons */
  size?: SizeValue;
  /** Color for all buttons. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: string;
  /** Visual style variant for all buttons */
  variant?: 'solid' | 'ghost';
  /** Orientation of the toggle group */
  orientation?: 'horizontal' | 'vertical';
  /** Whether selection is required (at least one must be selected) */
  required?: boolean;
  /** Custom styles */
  style?: any;
  /** Toggle buttons */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Props for a single toggle. Alias of {@link ToggleButtonProps} so the docs
 * site / playground can resolve controls for the `Toggle` component page.
 */
export type ToggleProps = ToggleButtonProps;

export interface ToggleGroupContextValue {
  value?: string | number | (string | number)[];
  onChange?: (value: string | number) => void;
  exclusive?: boolean;
  disabled?: boolean;
  size?: SizeValue;
  color?: string;
  variant?: 'solid' | 'ghost';
  required?: boolean;
}
