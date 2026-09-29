import type React from 'react';
import type { ViewStyle } from 'react-native';

import type { BorderRadiusProps } from '../../core/theme/radius';
import type { SizeValue } from '../../core/theme/sizes';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { LayoutProps } from '../../core/utils/layout';
import type { DisclaimerSupport } from '../_internal/Disclaimer';
import type { PassthroughAccessibilityProps } from '../Button/types';

export type ToggleValue = string | number;
export type ToggleGroupValue = ToggleValue | ToggleValue[];
export type ToggleVariant = 'solid' | 'ghost';

type PassthroughA11yProps = Omit<PassthroughAccessibilityProps, 'accessibilityLabel'>;

export interface ToggleButtonProps extends BaseProps<ViewStyle>, LayoutProps, BorderRadiusProps, PassthroughA11yProps {
  /** Value for this toggle button */
  value: ToggleValue;
  /**
   * Whether this button is selected (pressed). Standalone buttons are
   * controlled by it; inside a ToggleGroup the group's value decides.
   */
  selected?: boolean;
  /** Callback when button is pressed (standalone buttons) */
  onPress?: (value: ToggleValue) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Size of the toggle button */
  size?: SizeValue;
  /** Button color. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ColorProp;
  /** Visual style variant */
  variant?: ToggleVariant;
  /** Accessible name; required when the content isn't text (an icon-only toggle). */
  accessibilityLabel?: string;
}

export interface ToggleGroupProps extends BaseProps<ViewStyle>, LayoutProps, BorderRadiusProps, DisclaimerSupport {
  /** Current selected value(s) (controlled) */
  value?: ToggleGroupValue;
  /** Initial value(s) for uncontrolled usage */
  defaultValue?: ToggleGroupValue;
  /**
   * Called when selection changes: the pressed value (or `[]` when it was
   * deselected) in exclusive mode, the array of selected values otherwise.
   */
  onChange?: (value: ToggleGroupValue) => void;
  /** Whether only one option can be selected at a time (a radio group) */
  exclusive?: boolean;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Size of all toggle buttons */
  size?: SizeValue;
  /** Color for all buttons. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ColorProp;
  /** Visual style variant for all buttons */
  variant?: ToggleVariant;
  /** Orientation of the toggle group (also the arrow keys that move focus) */
  orientation?: 'horizontal' | 'vertical';
  /** Whether selection is required (at least one must be selected) */
  required?: boolean;
  /** Accessible name of the group */
  accessibilityLabel?: string;
  /** Toggle buttons */
  children: React.ReactNode;
}

/**
 * Props for a single toggle. Alias of {@link ToggleButtonProps} so the docs
 * site / playground can resolve controls for the `Toggle` component page.
 */
export type ToggleProps = ToggleButtonProps;

/** What a ToggleGroup shares with its buttons. */
export interface ToggleGroupContextValue {
  value?: ToggleGroupValue;
  onChange?: (value: ToggleValue) => void;
  exclusive?: boolean;
  disabled?: boolean;
  size?: SizeValue;
  color?: string;
  variant?: ToggleVariant;
  required?: boolean;
}
