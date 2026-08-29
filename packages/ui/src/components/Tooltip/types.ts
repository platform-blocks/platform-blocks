import React from 'react';
import { ViewStyle, View, StyleProp } from 'react-native';
import { SizeValue } from '../../core/theme/sizes';
import type { TextProps } from '../Text';

export type TooltipPositionType =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface TooltipProps {
  /** Tooltip label */
  label: React.ReactNode;
  /** Position of the tooltip */
  position?: TooltipPositionType;
  /** Whether to show an arrow */
  withArrow?: boolean;
  /** Tooltip color */
  color?: string;
  /** Border radius */
  radius?: SizeValue;
  /** Offset from target */
  offset?: number;
  /** Fixed bubble width. Omit to size to content (capped by `maxWidth`). */
  width?: number;
  /**
   * Largest width the bubble may grow to before the label wraps. Also clamped by
   * the available viewport space.
   * @default 280
   */
  maxWidth?: number;
  /** Clamp the label to N lines with an ellipsis. Unset = wrap freely. */
  lineClamp?: number;
  /** Whether tooltip is controlled */
  opened?: boolean;
  /** Open delay in ms */
  openDelay?: number;
  /** Close delay in ms */
  closeDelay?: number;
  /** Events that trigger tooltip */
  events?: {
    hover?: boolean;
    focus?: boolean;
    touch?: boolean;
  };
  /** Children element to attach tooltip to */
  children: React.ReactElement;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
  /** Override props applied to the label `<Text>` (style, weight, ff, size, color). */
  labelProps?: Omit<TextProps, 'children'>;
}

export interface TooltipFactoryPayload {
  props: TooltipProps;
  ref: View;
}

/** Everything a host component may forward to `Tooltip`, minus the wrapped child. */
export type TooltipConfig = Omit<TooltipProps, 'children'>;

/**
 * Shape of a `tooltip` prop on a host component (Button, IconButton, …):
 * a plain string for the common case, or a full config object to tune
 * position/width/delays. `false | null | undefined` renders no tooltip.
 */
export type TooltipPropValue = string | TooltipConfig | false | null;
