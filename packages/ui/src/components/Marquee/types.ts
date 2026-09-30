import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { SpacingValue } from '../../core/theme/types';
export interface MarqueeProps extends BaseProps<ViewStyle> {
  children: React.ReactNode;
  /** Time for one copy to travel its length in ms. @default 20000 */ duration?: number;
  /** Reverse travel direction. @default false */ reverse?: boolean;
  /** Pause on web hover and native press. @default false */ pauseOnHover?: boolean;
  /** Travel axis. @default 'horizontal' */ orientation?: 'horizontal' | 'vertical';
  /** Number of copies. @default 4 */ repeat?: number;
  /** Space between copies. @default 'md' */ gap?: SpacingValue;
  /** Mask the leading and trailing edges. @default true */ fadeEdges?: boolean;
  /** Color behind a fade edge. */ fadeEdgeColor?: string;
  /** Width of each edge fade. @default '5%' */ fadeEdgeSize?: string;
}
