import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

import type { UseRovingFocusResult } from '../../core/accessibility/useRovingFocus';
import type { SizeValue } from '../../core/theme/types';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { TextProps } from '../Text';

export interface StepperMetrics {
  iconSize: number;
  fontSize: number;
  spacing: number;
  descriptionFontSize: number;
  /** Thickness of the connector line between steps. */
  lineWidth: number;
}

export interface StepperStepProps extends Pick<BaseProps<ViewStyle>, 'style' | 'testID'> {
  /** Step content */
  children?: ReactNode;
  /** Step label */
  label?: string;
  /** Step description */
  description?: string;
  /** Custom icon to display instead of the step number */
  icon?: ReactNode;
  /** Icon to display when step is completed (overrides global completedIcon) */
  completedIcon?: ReactNode;
  /** Whether this step can be selected by clicking */
  allowStepSelect?: boolean;
  /** Step accent color: a palette name (`'teal'`), a shade (`'teal.6'`) or any CSS color. */
  color?: ColorProp;
  /** Whether the step is loading */
  loading?: boolean;
  /** Accessibility label for screen readers */
  'aria-label'?: string;
  /** Title attribute for tooltips */
  title?: string;
  /** Internal step index (added automatically) */
  stepIndex?: number;
  /** Internal: true for the first step in the stepper (added automatically) */
  isFirst?: boolean;
  /** Internal: true for the last step in the stepper (added automatically) */
  isLast?: boolean;
  /** Override props applied to the step's label `<Text>` (style, fw, ff, size, c). */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the step's description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;
}

export interface StepperProps extends BaseProps<ViewStyle> {
  /** Active step index */
  active: number;
  /** Called when step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Step orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Icon position relative to step body */
  iconPosition?: 'left' | 'right';
  /** Icon size */
  iconSize?: number;
  /** Component size: a size token, or a numeric control height. @default 'md' */
  size?: SizeValue;
  /** Accent color: a palette name (`'primary'`), a shade (`'primary.6'`) or any CSS color. */
  color?: ColorProp;
  /** Icon to display when step is completed */
  completedIcon?: ReactNode;
  /** Whether next steps (steps with higher index) can be selected */
  allowNextStepsSelect?: boolean;
  /** Step content */
  children: ReactNode;
  /** Accessible name of the stepper (renders it as a labelled group). */
  'aria-label'?: string;
}

export interface StepperCompletedProps {
  /** Content to display when all steps are completed */
  children: ReactNode;
}

export interface StepperContextValue {
  active: number;
  onStepClick?: (stepIndex: number) => void;
  orientation: 'horizontal' | 'vertical';
  iconPosition: 'left' | 'right';
  iconSize: number;
  size: SizeValue;
  metrics: StepperMetrics;
  color: string;
  completedIcon?: ReactNode;
  allowNextStepsSelect: boolean;
  /** Shared tab stop for pressable steps (present when `onStepClick` is set). */
  roving?: UseRovingFocusResult;
}
