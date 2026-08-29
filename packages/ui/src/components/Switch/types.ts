import React from 'react';
import { SizeValue, SpacingProps } from '../../core/theme/types';
import type { DisclaimerSupport } from '../_internal/Disclaimer';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { TextProps } from '../Text';

export interface BaseComponentProps extends SpacingProps {
  /** Component test ID for testing */
  testID?: string;
  
  /** Additional CSS styles */
  style?: any;
}

export interface SwitchProps extends BaseComponentProps, DisclaimerSupport {
  /** Whether switch is on */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage */
  defaultChecked?: boolean;
  
  /** Change handler */
  onChange?: (checked: boolean) => void;
  
  /** Switch size */
  size?: SizeValue;

  /**
   * Visual style of the switch.
   * - `filled` (default): solid track that fills with `color` when on, white thumb.
   * - `outline`: transparent track with a colored border and a colored thumb when on.
   * - `ios`: iOS-style pill — a large white thumb that nearly fills a rounded track.
   * - `android`: Material-3-style — an outlined track with a small dot thumb that
   *   grows and turns white as the switch turns on.
   */
  variant?: 'filled' | 'outline' | 'ios' | 'android';

  /** Switch color when on. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;

  /**
   * Length of the on/off transition in ms. `0` moves the thumb instantly.
   * When omitted the switch keeps its spring animation; any explicit value
   * (including 0) swaps it for a timing curve. Always 0 under reduced motion.
   */
  transitionDuration?: number;
  
  /** Switch label */
  label?: React.ReactNode;
  
  /** Whether switch is disabled */
  disabled?: boolean;
  
  /** Whether switch is required */
  required?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  description?: string;
  
  /** Label position relative to switch */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  
  /** Switch content/children (alternative to label) */
  children?: React.ReactNode;
  
  /** Icon to show when on */
  onIcon?: React.ReactNode;
  
  /** Icon to show when off */
  offIcon?: React.ReactNode;
  
  /** Labels for on/off states */
  onLabel?: string;
  offLabel?: string;
  
  /** Controlled component to show/hide */
  controls?: string; // ID of controlled element
  
  /** Custom accessibility label (overrides label-based default) */
  accessibilityLabel?: string;
  
  /** Accessibility hint to describe what happens */
  accessibilityHint?: string;

  /** Override props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;
}

export interface SwitchStyleProps {
  checked: boolean;
  disabled: boolean;
  error: boolean;
  size: SizeValue;
  color: ThemeColor;
  variant?: 'filled' | 'outline' | 'ios' | 'android';
}
