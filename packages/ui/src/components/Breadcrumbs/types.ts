import { ReactNode } from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/theme/types';
import { type ComponentSizeValue } from '../../core/theme/componentSize';
import type { TextProps } from '../Text';

export interface BreadcrumbItem {
  /** The label text for the breadcrumb */
  label: string;
  
  /** The href/path for navigation */
  href?: string;
  
  /** Custom icon to display before the label */
  icon?: ReactNode;
  
  /** Press handler for the breadcrumb item */
  onPress?: () => void;
  
  /** Whether this breadcrumb is disabled */
  disabled?: boolean;
}

export interface BreadcrumbsProps extends SpacingProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  
  /** Custom separator between breadcrumbs (string, icon, or any React component) */
  separator?: ReactNode;
  
  /** Maximum number of items to show (will collapse middle items) */
  maxItems?: number;
  
  /** Size of the breadcrumbs */
  size?: ComponentSizeValue;
  
  /** Whether to show icons */
  showIcons?: boolean;
  
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  
  /** Custom text styles */
  textStyle?: StyleProp<TextStyle>;
  
  /** Custom separator styles */
  separatorStyle?: StyleProp<ViewStyle>;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Override props applied to each item's label `<Text>` (style, weight, ff, size, color). */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the separator `<Text>` when it's a string. */
  separatorProps?: Omit<TextProps, 'children'>;
}
