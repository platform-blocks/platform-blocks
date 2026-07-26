import React from 'react';
import { SizeValue, ColorValue, SpacingProps } from '../../core/theme/types';
import type { TextProps } from '../Text';

export interface BaseComponentProps extends SpacingProps {
  /** Component test ID for testing */
  testID?: string;

  /** Additional CSS styles */
  style?: any;
}

/**
 * Visual variant of a `RadioGroup`.
 * - `default` — stacked/inline radio dots with labels (current look)
 * - `card` — each option is a bordered/padded surface; selected card gets the colored border + tint
 * - `segmented` — joined buttons sharing borders, like an iOS/macOS segmented control (forced horizontal)
 * - `chip` — compact rounded pills that wrap; great for filters and tag pickers
 */
export type RadioGroupVariant = 'default' | 'card' | 'segmented' | 'chip';

export interface RadioProps extends BaseComponentProps {
  /** Radio value */
  value: string;
  
  /** Whether radio is selected */
  checked?: boolean;
  
  /** Change handler */
  onChange?: (value: string) => void;
  
  /** Radio group name */
  name?: string;
  
  /** Radio size */
  size?: SizeValue;
  
  /** Radio color theme */
  color?: ColorValue;
  
  /** Radio label */
  label?: React.ReactNode;
  
  /** Whether radio is disabled */
  disabled?: boolean;
  
  /** Whether radio is required */
  required?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  description?: string;
  
  /** Label position relative to radio */
  labelPosition?: 'left' | 'right';
  
  /** Radio content/children (alternative to label) */
  children?: React.ReactNode;

  /** Optional icon displayed alongside the label */
  icon?: React.ReactNode | string;

  /** Key handler for accessibility/keyboard support */
  onKeyDown?: (event: any) => void;

  /** Override props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;

  /**
   * Length of the select/deselect animation in ms; the center dot grows in and
   * shrinks out against it. `0` applies the state instantly. Always 0 under
   * reduced motion.
   * @default 160
   */
  transitionDuration?: number;
}

export interface RadioGroupProps extends BaseComponentProps {
  /** Available options */
  options: Array<{ 
    label: React.ReactNode; 
    value: string; 
    disabled?: boolean;
    description?: string;
    icon?: React.ReactNode | string;
  }>;
  
  /** Selected value */
  value?: string;
  
  /** Change handler */
  onChange?: (value: string) => void;
  
  /** Group name for form submission */
  name?: string;
  
  /** Group orientation. Ignored by `segmented` (always horizontal) and `chip` (wraps). */
  orientation?: 'vertical' | 'horizontal';

  /** Visual variant of the group. Defaults to `'default'`. */
  variant?: RadioGroupVariant;
  
  /** Radio size */
  size?: SizeValue;
  
  /** Radio color theme */
  color?: ColorValue;
  
  /** Group label */
  label?: React.ReactNode;
  
  /** Whether group is disabled */
  disabled?: boolean;
  
  /** Whether group is required */
  required?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  description?: string;
  
  /** Gap between radio options */
  gap?: SizeValue | number;

  /** Label position relative to each radio */
  labelPosition?: 'left' | 'right';

  /**
   * Length of each radio's select/deselect animation in ms. `0` applies the
   * state instantly. Only the `default` variant animates. Always 0 under
   * reduced motion.
   * @default 160
   */
  transitionDuration?: number;
}

export interface RadioStyleProps {
  checked: boolean;
  disabled: boolean;
  error: boolean;
  size: SizeValue;
  color: ColorValue;
}
