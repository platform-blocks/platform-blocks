import React from 'react';
import { SizeValue, SpacingProps } from '../../core/theme/types';
import type { TextProps } from '../Text';

export interface BaseComponentProps extends SpacingProps {
  /** Component test ID for testing */
  testID?: string;
  
  /** Additional CSS styles */
  style?: any;
}

export interface CheckboxProps extends BaseComponentProps {
  /** Whether checkbox is checked */
  checked?: boolean;
  /** Initial checked value for uncontrolled usage */
  defaultChecked?: boolean;
  
  /** Change handler */
  onChange?: (checked: boolean) => void;
  
  /** Indeterminate state for partial selections */
  indeterminate?: boolean;
  
  /** Custom color override */
  color?: string;
  
  /** Named color variant from theme */
  colorVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  
  /** Checkbox size */
  size?: SizeValue;
  
  /** Checkbox label */
  label?: React.ReactNode;
  
  /** Whether checkbox is disabled */
  disabled?: boolean;
  
  /** Whether checkbox is required */
  required?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  description?: string;
  
  /** Icon to show when checked */
  icon?: React.ReactNode;
  
  /** Icon to show when indeterminate */
  indeterminateIcon?: React.ReactNode;
  
  /** Label position relative to checkbox */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';

  /** Override styles/props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override styles/props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;

  /**
   * Length of the check/uncheck animation in ms; the fill and mark phases scale
   * against it. `0` applies the state instantly. Always 0 under reduced motion.
   * @default 160
   */
  transitionDuration?: number;

  /** Checkbox content/children (alternative to label) */
  children?: React.ReactNode;

  /** Accessibility label, used when there is no visible text label */
  accessibilityLabel?: string;
}

export interface CheckboxStyleProps {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  error: boolean;
  size: SizeValue;
  color?: string;
  colorVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
}
