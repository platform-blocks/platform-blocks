import { ReactNode } from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/theme/types';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { TextProps } from '../Text';

export interface PaginationMetrics {
  height: number;
  minWidth: number;
  paddingHorizontal: number;
  fontSize: number;
  iconSize: number;
  borderRadius: number;
}

export interface PaginationProps extends SpacingProps {
  /** Current page number (1-indexed) */
  current: number;
  
  /** Total number of pages */
  total: number;
  
  /** Number of page items to show on each side of current page */
  siblings?: number;
  
  /** Number of page items to show at the boundaries */
  boundaries?: number;
  
  /** Page change handler */
  onChange: (page: number) => void;
  
  /** Size of pagination controls */
  size?: ComponentSizeValue;
  
  /** Variant style */
  variant?: 'default' | 'outline' | 'subtle';
  
  /** Color scheme */
  color?: 'primary' | 'secondary' | 'gray';
  
  /** Show first/last page buttons */
  showFirst?: boolean;
  
  /** Show previous/next buttons */
  showPrevNext?: boolean;
  
  /** Custom labels for navigation buttons */
  labels?: {
    first?: ReactNode;
    previous?: ReactNode;
    next?: ReactNode;
    last?: ReactNode;
  };
  
  /** Whether pagination is disabled */
  disabled?: boolean;
  
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  
  /** Custom button styles */
  buttonStyle?: StyleProp<ViewStyle>;
  
  /** Custom active button styles */
  activeButtonStyle?: StyleProp<ViewStyle>;
  
  /** Custom text styles */
  textStyle?: StyleProp<TextStyle>;
  
  /** Custom active text styles */
  activeTextStyle?: StyleProp<TextStyle>;
  
  /** Hide pagination when there's only one page */
  hideOnSinglePage?: boolean;
  
  /** Show page size selector */
  showSizeChanger?: boolean;
  
  /** Available page sizes */
  pageSizeOptions?: number[];
  
  /** Current page size */
  pageSize?: number;
  
  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;
  
  /** Show total count */
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);

  /** Total number of items */
  totalItems?: number;

  /** Override props applied to every page-button label `<Text>` (style, weight, ff, size, color). */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the active page-button label `<Text>` (merged on top of `labelProps`). */
  activeLabelProps?: Omit<TextProps, 'children'>;
}
