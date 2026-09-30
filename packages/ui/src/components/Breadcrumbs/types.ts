import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import type { TextProps } from '../Text';

export interface BreadcrumbItem {
  /** The label text for the breadcrumb */
  label: string;

  /**
   * The href/path for navigation. On web an item with `href` and no `onPress`
   * renders as a real link; with `onPress`, the press handler does the routing.
   */
  href?: string;

  /** Custom icon to display before the label (decorative) */
  icon?: ReactNode;

  /** Press handler for the breadcrumb item */
  onPress?: () => void;

  /** Whether this breadcrumb is disabled */
  disabled?: boolean;
}

export interface BreadcrumbsProps extends BaseProps<ViewStyle> {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];

  /** Custom separator between breadcrumbs (string, icon, or any React component). Hidden from assistive technology. */
  separator?: ReactNode;

  /** Maximum number of items to show (will collapse middle items) */
  maxItems?: number;

  /** Size of the breadcrumbs: a font-size token or a px font size. @default 'md' */
  size?: SizeValue;

  /** Whether to show icons */
  showIcons?: boolean;

  /** Custom text styles */
  textStyle?: StyleProp<TextStyle>;

  /** Custom separator styles */
  separatorStyle?: StyleProp<ViewStyle>;

  /** Accessible name of the navigation landmark. @default 'Breadcrumb' */
  accessibilityLabel?: string;

  /** Override props applied to each item's label `<Text>` (style, fw, ff, size, c). */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the separator `<Text>` when it's a string. */
  separatorProps?: Omit<TextProps, 'children'>;
}
