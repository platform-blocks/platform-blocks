import type React from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import type { BaseProps, ColorProp } from '../../core/types/base';

export interface EmptyStateProps extends BaseProps<ViewStyle> {
  /** Illustration or icon shown before the message. */
  icon?: React.ReactNode;
  /** Short empty-state title. */
  title?: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Compound content, rendered after shorthand content. */
  children?: React.ReactNode;
  /** Content arrangement. @default 'center' */
  align?: 'center' | 'start' | 'end';
  /** Colored indicator treatment. */
  variant?: 'filled' | 'light';
  /** Indicator accent. @default 'primary' */
  color?: ColorProp;
  /** Adds a neutral circular indicator background. @default false */
  withIndicatorBackground?: boolean;
  /** Scale of indicator, spacing, and text. @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export interface EmptyStateIndicatorProps extends BaseProps<ViewStyle> { children?: React.ReactNode }
export interface EmptyStateTitleProps extends BaseProps<TextStyle> {
  children?: React.ReactNode;
  /** Heading level. Without it the title is plain text. */
  order?: 1 | 2 | 3 | 4 | 5 | 6;
}
export interface EmptyStateDescriptionProps extends BaseProps<TextStyle> { children?: React.ReactNode }
export interface EmptyStateActionsProps extends BaseProps<ViewStyle> { children?: React.ReactNode }
