import type { ReactElement, ReactNode } from 'react';
import type { View } from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { TextProps } from '../Text';

export type TooltipPositionType =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface TooltipEvents {
  /** Show while the pointer rests on the trigger (web). @default true */
  hover?: boolean;
  /** Show while the trigger has keyboard focus. @default true */
  focus?: boolean;
  /** Toggle on press (touch); on web a press shows it. @default true */
  touch?: boolean;
}

export interface TooltipProps extends BaseProps {
  /** Tooltip label. Also becomes the trigger's accessible description. */
  label: ReactNode;
  /** Position of the tooltip (written for LTR; mirrored in RTL). @default 'top' */
  position?: TooltipPositionType;
  /** Whether to show an arrow */
  withArrow?: boolean;
  /**
   * Bubble color: a palette token (`'primary'`, `'red.6'`) or any CSS color.
   * The label color is picked for contrast. @default an inverted surface
   */
  color?: ThemeColor;
  /** Border radius. @default 'md' */
  radius?: RadiusValue;
  /** Offset from target */
  offset?: number;
  /** Fixed bubble width in px (not the root's). Omit to size to content, capped by `maw`. */
  w?: number;
  /**
   * Largest width the bubble may grow to before the label wraps. Also clamped by
   * the available viewport space.
   * @default 280
   */
  maw?: number;
  /** Clamp the label to N lines with an ellipsis. Unset = wrap freely. */
  lineClamp?: number;
  /** Controlled open state. */
  opened?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpened?: boolean;
  /** Called when the tooltip opens (uncontrolled or requested). */
  onOpen?: () => void;
  /** Called when the tooltip closes or asks to close (Escape, pointer / focus leaving). */
  onClose?: () => void;
  /** Open delay in ms */
  openDelay?: number;
  /** Close delay in ms */
  closeDelay?: number;
  /** Events that show the tooltip. Focus is on by default so keyboard users see it. */
  events?: TooltipEvents;
  /** Never show the tooltip. */
  disabled?: boolean;
  /** Children element to attach tooltip to */
  children: ReactElement;
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
