import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import type { TextProps } from '../Text';

export type AlertVariant = 'light' | 'filled' | 'outline' | 'subtle';
export type AlertColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends SpacingProps, BorderRadiusProps {
  variant?: AlertVariant;
  color?: AlertColor | string;
  /** Severity helper — sets both color and default icon (info | success | warning | error). */
  sev?: AlertSeverity;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode | string | null | false;
  fullWidth?: boolean;
  withCloseButton?: boolean;
  closeButtonLabel?: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Override props applied to the title `<Text>` (style, weight, ff, size, colorVariant). */
  titleProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the body `<Text>` (the `children` content). */
  bodyProps?: Omit<TextProps, 'children'>;
}

export interface AlertFactoryPayload {
  props: AlertProps;
  ref: View;
}

/** @deprecated Use `AlertVariant`. `Notice` is an alias of `Alert`. */
export type NoticeVariant = AlertVariant;
/** @deprecated Use `AlertColor`. `Notice` is an alias of `Alert`. */
export type NoticeColor = AlertColor;
/** @deprecated Use `AlertSeverity`. `Notice` is an alias of `Alert`. */
export type NoticeSeverity = AlertSeverity;
/** @deprecated Use `AlertProps`. `Notice` is an alias of `Alert`. */
export type NoticeProps = AlertProps;
/** @deprecated Use `AlertFactoryPayload`. `Notice` is an alias of `Alert`. */
export type NoticeFactoryPayload = AlertFactoryPayload;
