import type React from 'react';
import type { PressableProps, ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps, ColorProp, RadiusValue } from '../../core/types/base';
import type { ScrollSpyOptions, UseScrollSpyItem as TocItem } from '../../hooks/useScrollSpy';

/** Props `getControlProps` may return for an item's control: Pressable props, plus replacement `children`. */
export type TableOfContentsControlProps = Partial<Omit<PressableProps, 'children'>> & {
  /** Replaces the default label. */
  children?: React.ReactNode;
};

export interface TableOfContentsProps extends BaseProps<ViewStyle> {
  /**
   * Visual style variant for the table of contents
   * @default 'none'
   */
  variant?: 'filled' | 'outline' | 'ghost' | 'none';

  /**
   * Background color for the filled variant (and the active-item marker): a
   * palette name, a shade (`'primary.6'`) or any CSS color. Falls back to the
   * theme primary color.
   */
  color?: ColorProp;

  /**
   * Text size for table of contents items
   * @default 'sm'
   */
  size?: SizeValue;

  /**
   * Border radius of the container: a radius token, px number, `'none'` or `'full'`.
   * @default 'md'
   */
  radius?: RadiusValue;

  /**
   * Configuration options for scroll spy behavior
   */
  scrollSpyOptions?: ScrollSpyOptions;

  /**
   * Function to customize props for each table of contents item control
   * @param payload - Object containing item data, active state, and index
   * @returns Props to spread onto the control element (`children` replaces the label)
   */
  getControlProps?: (payload: { data: TocItem; active: boolean; index: number }) => TableOfContentsControlProps;

  /**
   * Initial data for table of contents items (useful for SSR or pre-rendering)
   */
  initialData?: TocItem[];

  /**
   * Depth from which items are indented: an item is offset by
   * `(depth - minDepthToOffset) × depthOffset` px (never negative).
   * @default 1
   */
  minDepthToOffset?: number;

  /**
   * Pixel offset to apply for each depth level (indentation amount)
   * @default 20
   */
  depthOffset?: number;

  /**
   * Ref to expose the reinitialize function for manually triggering TOC refresh
   */
  reinitializeRef?: React.RefObject<(() => void) | null>;

  /**
   * Automatically adjust text color for contrast when using filled variant
   * @default false
   */
  autoContrast?: boolean;

  /**
   * Callback fired when the active item changes
   * @param id - ID of the newly active item, or null if none
   * @param item - The complete TocItem object if available
   */
  onActiveChange?: (id: string | null, item?: TocItem) => void;

  /**
   * CSS selector string or HTMLElement to use as the scroll container
   * @default 'main, [role="main"], .main-content, #main-content, article, .content, #content'
   */
  container?: string | HTMLElement;

  /**
   * Accessible name of the navigation landmark.
   * @default 'Table of contents'
   */
  accessibilityLabel?: string;
}

export type { TocItem };
