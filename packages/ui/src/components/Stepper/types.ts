import { ReactNode } from 'react';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { TextProps } from '../Text';

export interface StepperMetrics {
  iconSize: number;
  fontSize: number;
  spacing: number;
  descriptionFontSize: number;
  /** Thickness of the connector line between steps. */
  lineWidth: number;
}

export interface StepperStepProps {
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
  /** Step color */
  color?: string;
  /** Whether the step is loading */
  loading?: boolean;
  /** Accessibility label for screen readers */
  'aria-label'?: string;
  /** Title attribute for tooltips */
  title?: string;
  /** Step reference */
  ref?: React.Ref<HTMLButtonElement>;
  /** Internal step index (added automatically) */
  stepIndex?: number;
  /** Internal: true for the first step in the stepper (added automatically) */
  isFirst?: boolean;
  /** Internal: true for the last step in the stepper (added automatically) */
  isLast?: boolean;
  /** Override props applied to the step's label `<Text>` (style, weight, ff, size, colorVariant). */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the step's description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;
}

export interface StepperProps {
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
  /** Component size */
  size?: ComponentSizeValue;
  /** Component color */
  color?: string;
  /** Icon to display when step is completed */
  completedIcon?: ReactNode;
  /** Whether next steps (steps with higher index) can be selected */
  allowNextStepsSelect?: boolean;
  /** Step content */
  children: ReactNode;
  /** Accessibility label */
  'aria-label'?: string;
  /** Component reference */
  ref?: React.Ref<HTMLDivElement>;
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
  size: ComponentSizeValue;
  metrics: StepperMetrics;
  color: string;
  completedIcon?: ReactNode;
  allowNextStepsSelect: boolean;
}
