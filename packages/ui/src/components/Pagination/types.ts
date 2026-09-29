import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { TextProps } from '../Text';

/**
 * Accessible names for Pagination's landmark and controls. Defaults are English
 * ("Pagination", "First page", "Previous page", "Next page", "Last page",
 * "Page 3"); pass translations here.
 */
export interface PaginationAccessibilityLabels {
  /** Label of the `navigation` landmark. @default 'Pagination' */
  root?: string;
  /** @default 'First page' */
  first?: string;
  /** @default 'Previous page' */
  previous?: string;
  /** @default 'Next page' */
  next?: string;
  /** @default 'Last page' */
  last?: string;
  /** Name of a page button. @default (page) => `Page ${page}` */
  page?: (page: number) => string;
}

export interface PaginationProps extends BaseProps<ViewStyle> {
  /** Current page number (1-indexed). Controlled. */
  value?: number;

  /** Initial page when uncontrolled. @default 1 */
  defaultValue?: number;

  /**
   * @deprecated Use `value` instead.
   */
  current?: number;

  /** Total number of pages */
  total: number;

  /** Number of page items to show on each side of current page */
  siblings?: number;

  /** Number of page items to show at the boundaries */
  boundaries?: number;

  /** Called with the new page number (1-indexed). */
  onChange?: (page: number) => void;

  /**
   * Size of the pagination controls. Page items are compact controls: they
   * render one step below `size` on the shared control scale.
   * @default 'md'
   */
  size?: SizeValue;

  /** Variant style */
  variant?: 'default' | 'outline' | 'subtle';

  /**
   * Accent color of the current page: a palette name (`'primary'`), a shade
   * (`'primary.6'`) or any CSS color.
   * @default 'primary'
   */
  color?: ColorProp;

  /** Show first/last page buttons */
  showFirst?: boolean;

  /** Show previous/next buttons */
  showPrevNext?: boolean;

  /** Custom visible content for the navigation buttons (defaults to chevron icons). */
  labels?: {
    first?: ReactNode;
    previous?: ReactNode;
    next?: ReactNode;
    last?: ReactNode;
  };

  /** Accessible names for the landmark and controls (for translation). */
  accessibilityLabels?: PaginationAccessibilityLabels;

  /** Whether pagination is disabled */
  disabled?: boolean;

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

  /** Override props applied to every page-button label `<Text>` (style, fw, ff, size, c). */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the active page-button label `<Text>` (merged on top of `labelProps`). */
  activeLabelProps?: Omit<TextProps, 'children'>;
}
