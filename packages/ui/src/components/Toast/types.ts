import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import type { BorderRadiusProps } from '../../core/theme/radius';
import type { BaseProps } from '../../core/types/base';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { TextProps } from '../Text';

export type ToastVariant = 'light' | 'filled' | 'outline';
export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';
/** Edge a toast travels from when it enters (derived from its stack's screen position). */
export type ToastDirection = 'top' | 'bottom' | 'left' | 'right';
/**
 * @deprecated Use `ToastDirection`. (The public `ToastPosition` exported from
 * the package is the stack's screen position — see `ToastStackPosition`.)
 */
export type ToastPosition = ToastDirection;
export type ToastAnimationType = 'slide' | 'fade' | 'bounce' | 'scale';

/** Metrics a single `size` token resolves to. */
export interface ToastSizeMetrics {
  /** Inner padding of the toast surface */
  padding: number;
  /** Gap between the icon / content / actions / close columns */
  gap: number;
  /** Title font size */
  titleSize: number;
  /** Space between title and body */
  titleGap: number;
  /** Body font size */
  bodySize: number;
  /** Body line height */
  bodyLineHeight: number;
  /** Leading icon (and loading spinner) size */
  iconSize: number;
  /** Minimum height of the toast surface */
  minHeight: number;
  /** Action button font size */
  actionFontSize: number;
  /** Action button horizontal padding */
  actionPaddingHorizontal: number;
  /** Action button vertical padding */
  actionPaddingVertical: number;
  /** Close button hit-target size */
  closeButtonSize: number;
}

export interface ToastAction {
  label: string;
  onPress: () => void;
  color?: string;
}

export interface ToastAnimationConfig {
  type?: ToastAnimationType;
  duration?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
  /** Easing function (a reanimated `Easing`). */
  easing?: (value: number) => number;
}

export interface ToastSwipeConfig {
  enabled?: boolean;
  threshold?: number; // Distance to trigger dismiss
  direction?: 'horizontal' | 'vertical' | 'both';
  velocityThreshold?: number;
}

export interface ToastProps extends BaseProps, BorderRadiusProps {
  /** Toast variant */
  variant?: ToastVariant;
  /**
   * Size token controlling padding, typography, icon, and close-button scale.
   * Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which
   * is read as the title font size and scales the rest proportionally.
   * @default 'md'
   */
  size?: ComponentSizeValue;
  /** Toast color - can be theme color or custom color string */
  color?: ThemeColor;
  /**
   * Severity level — sets the color, the default icon, and the haptic played on
   * appear. More than a color: prefer it over `color` for status toasts.
   */
  severity?: ToastSeverity;
  /** Toast title */
  title?: string;
  /** Toast content */
  children?: React.ReactNode;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether to show close button */
  withCloseButton?: boolean;
  /** Whether to show loading indicator */
  loading?: boolean;
  /** Close button accessibility label */
  closeButtonLabel?: string;
  /** Callback when close button is pressed */
  onClose?: () => void;
  /**
   * Fired once the hide transition has finished playing. `ToastProvider` uses
   * this to unmount a toast exactly when it finishes leaving instead of on a
   * fixed timer, so a custom `transitionDuration` never gets cut short.
   */
  onExited?: () => void;
  /** Whether the toast is visible */
  visible?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /**
   * Show/hide transition length in ms. Cross-component spelling that takes
   * precedence over `animationDuration`; `0` shows and hides with no animation.
   * @default 300
   */
  transitionDuration?: number;
  /** Auto hide duration in ms (0 to disable) */
  autoHide?: number;
  /**
   * Suspends the auto-hide countdown without resetting it; clearing it resumes
   * with the time that was left. `ToastProvider` sets this for every toast in a
   * stack while the pointer or keyboard focus is inside that stack.
   * @default false
   */
  paused?: boolean;
  /** Edge the toast enters from (animation direction) */
  position?: ToastDirection;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
  /** Action buttons */
  actions?: ToastAction[];
  /** Whether toast can be dismissed by tapping */
  dismissOnTap?: boolean;
  /** Persist toast until manually dismissed */
  persistent?: boolean;
  /** Keep toast mounted in the tree when hidden */
  keepMounted?: boolean;
  /** Animation configuration */
  animationConfig?: ToastAnimationConfig;
  /** Swipe to dismiss configuration */
  swipeConfig?: ToastSwipeConfig;
  /** Callback when toast is dismissed via swipe */
  onSwipeDismiss?: () => void;
  /**
   * Whether the toast text can be selected. Toasts are transient chrome that is
   * usually swiped or tapped, so a press-and-hold that starts a selection reads
   * as a glitch rather than an affordance.
   * @default false
   */
  selectable?: boolean;
  /** Override props applied to the title `<Text>` (style, fw, ff, size, c). */
  titleProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the body `<Text>` (the `children` content). */
  bodyProps?: Omit<TextProps, 'children'>;
}
