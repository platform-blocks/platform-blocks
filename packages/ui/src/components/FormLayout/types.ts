import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';

export type { FormFieldProps } from '../Form/types';

export interface FormLayoutProps extends BaseProps<ViewStyle> {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  /** `card`: subtle filled panel with a border. `modal`: raised surface with a shadow. */
  variant?: 'default' | 'card' | 'modal';
}

export interface FormSectionProps extends BaseProps<ViewStyle> {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  /** Let the user collapse the section from its header. */
  collapsible?: boolean;
  /** Controlled expanded state (with `collapsible`). */
  expanded?: boolean;
  /** Initial expanded state while uncontrolled. Default true. */
  defaultExpanded?: boolean;
  /** Called when the header toggles the section. */
  onExpandedChange?: (expanded: boolean) => void;
}

export interface FormGroupProps extends BaseProps<ViewStyle> {
  children: ReactNode;
  direction?: 'row' | 'column';
  columns?: 2 | 3 | 4;
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
}
