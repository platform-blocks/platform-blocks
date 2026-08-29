import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { TextProps } from '../Text';

export type AlertVariant = 'light' | 'filled' | 'outline' | 'subtle';
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends SpacingProps, BorderRadiusProps {
  variant?: AlertVariant;
  color?: ThemeColor;
  /**
   * Severity helper — sets both the color and the default icon
   * (`info | success | warning | error`). More than a color: prefer it over
   * `color` when the alert carries a status, so the icon comes with it.
   */
  severity?: AlertSeverity;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode | string | null | false;
  fullWidth?: boolean;
  withCloseButton?: boolean;
  closeButtonLabel?: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Override props applied to the title `<Text>` (style, weight, ff, size, color). */
  titleProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the body `<Text>` (the `children` content). */
  bodyProps?: Omit<TextProps, 'children'>;
}

export interface AlertFactoryPayload {
  props: AlertProps;
  ref: View;
}
