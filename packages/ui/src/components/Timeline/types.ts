import type { ReactNode } from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps, ColorProp } from '../../core/types/base';

export interface TimelineSizeMetrics {
  bulletSize: number;
  lineWidth: number;
  fontSize: number;
  spacing: number;
}

/** View props passed through to the root (children and style are typed separately). */
type PassthroughViewProps = Omit<ViewProps, 'children' | 'style' | 'testID'>;

export interface TimelineItemProps extends PassthroughViewProps, BaseProps<ViewStyle> {
  /** Item content */
  children?: ReactNode;
  /** Item title */
  title?: string;
  /** Optional timestamp text or node */
  timestamp?: ReactNode;
  /** Custom bullet content (icon, avatar, etc.) */
  bullet?: ReactNode;
  /** Line variant for this item */
  lineVariant?: 'solid' | 'dashed' | 'dotted';
  /** Item color (overrides timeline color). Palette token, `'primary.5'` shade syntax, or any CSS color. */
  color?: ColorProp;
  /** Override title text color for this item */
  titleColor?: string;
  /** Override description text color for this item */
  descriptionColor?: string;
  /** Override timestamp text color for this item */
  timestampColor?: string;
  /** Whether this item is active */
  active?: boolean;
  /** Override timeline alignment for this specific item (`left` = start side, `right` = end side; they flip under RTL) */
  itemAlign?: 'left' | 'right';
}

export interface TimelineProps extends PassthroughViewProps, BaseProps<ViewStyle> {
  /** Timeline items */
  children: ReactNode;
  /** Active item index - items before this will be highlighted */
  active?: number;
  /** Timeline color. Palette token, `'primary.5'` shade syntax, or any CSS color. */
  color?: ColorProp;
  /** Default title color for all items */
  titleColor?: string;
  /** Default description color for all items */
  descriptionColor?: string;
  /** Default timestamp color for all items */
  timestampColor?: string;
  /** Line width */
  lineWidth?: number;
  /** Bullet size */
  bulletSize?: number;
  /** Side of the spine the content sits on (`left` = start side, `right` = end side; they flip under RTL) */
  align?: 'left' | 'right';
  /** Reverse active highlighting */
  reverseActive?: boolean;
  /** Component size: a size token, or the title font size in px */
  size?: SizeValue;
  /** Center mode renders a single central spine allowing items on both sides via itemAlign prop */
  centerMode?: boolean;
}

export interface TimelineContextValue {
  active?: number;
  color: string;
  lineWidth: number;
  bulletSize: number;
  align: 'left' | 'right';
  reverseActive: boolean;
  size: SizeValue;
  metrics: TimelineSizeMetrics;
  /** Whether layout is split with centered vertical line */
  centerMode?: boolean;
  /** Default title color for items */
  titleColor?: string;
  /** Default description color for items */
  descriptionColor?: string;
  /** Default timestamp color for items */
  timestampColor?: string;
}
