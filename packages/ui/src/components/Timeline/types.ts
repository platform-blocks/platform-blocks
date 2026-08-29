import { ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { type ComponentSizeValue } from '../../core/theme/componentSize';

export interface TimelineSizeMetrics {
  bulletSize: number;
  lineWidth: number;
  fontSize: number;
  spacing: number;
}

export interface TimelineItemProps extends Omit<ViewProps, 'children'> {
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
  color?: string;
  /** Override title text color for this item */
  titleColor?: string;
  /** Override description text color for this item */
  descriptionColor?: string;
  /** Override timestamp text color for this item */
  timestampColor?: string;
  /** Whether this item is active */
  active?: boolean;
  /** Override timeline alignment for this specific item */
  itemAlign?: 'left' | 'right';
}

export interface TimelineProps extends Omit<ViewProps, 'children'> {
  /** Timeline items */
  children: ReactNode;
  /** Active item index - items before this will be highlighted */
  active?: number;
  /** Timeline color. Palette token, `'primary.5'` shade syntax, or any CSS color. */
  color?: string;
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
  /** Alignment of timeline */
  align?: 'left' | 'right';
  /** Reverse active highlighting */
  reverseActive?: boolean;
  /** Component size */
  size?: ComponentSizeValue;
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
  size: ComponentSizeValue;
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
