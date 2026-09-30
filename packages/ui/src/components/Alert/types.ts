import type React from 'react';
import type { View, ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { RadiusValue } from '../../core/theme/radius';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { TextProps } from '../Text';

export type AlertVariant = 'light' | 'filled' | 'outline' | 'subtle';
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends BaseProps<ViewStyle> {
  variant?: AlertVariant;
  /**
   * Accent color. Without a `severity`, `error` / `warning` colors also make the
   * alert urgent (`role="alert"`); every other color is a polite `role="status"`.
   */
  color?: ThemeColor;
  /**
   * Severity helper — sets the color, the default icon, and the live-region
   * urgency: `error` / `warning` render `role="alert"` (and are announced on
   * mount on native), `info` / `success` render `role="status"`. Prefer it over
   * `color` when the alert carries a status.
   */
  severity?: AlertSeverity;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode | string | null | false;
  fullWidth?: boolean;
  withCloseButton?: boolean;
  /** Accessible name of the close button. @default 'Close' */
  closeButtonLabel?: string;
  onClose?: () => void;
  /** Corner radius: theme radius token, px, `'none'` or `'full'`. @default 'md' */
  radius?: RadiusValue;
  /** Override props applied to the title `<Text>` (style, fw, ff, size, c). */
  titleProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the body `<Text>` (the `children` content). */
  bodyProps?: Omit<TextProps, 'children'>;
}

export interface AlertFactoryPayload {
  props: AlertProps;
  ref: View;
}
