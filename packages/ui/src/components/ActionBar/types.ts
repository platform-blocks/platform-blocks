import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ShadowToken } from '../../core/theme/shadow';
export interface ActionBarProps extends BaseProps<ViewStyle> {
  /** Actions rendered in the bar. */ children?: React.ReactNode;
  /** Controls visibility. */ opened: boolean;
  /** Called by the close button or Escape when enabled. */ onClose?: () => void;
  /** Let Escape dismiss this bar once layers above it close. @default false */ closeOnEscape?: boolean;
  /** Preserve the hidden bar in the tree. @default false */ keepMounted?: boolean;
  /** Render at the application root. @default true */ withinPortal?: boolean;
  /** Logical viewport insets. @default { bottom: 24 } */ position?: { top?: number; bottom?: number; start?: number; end?: number };
  /** Corner radius. @default 'md' */ radius?: RadiusValue;
  /** Surface shadow. @default 'md' */ shadow?: ShadowToken;
  /** Draw a border. @default true */ withBorder?: boolean;
  /** Stack order. */ zIndex?: number;
  /** Entrance effect. @default 'pop' */ transition?: 'pop' | 'slide-up' | 'fade';
  /** Animation duration in ms. @default 200 */ transitionDuration?: number;
  /** Accessible group label. @default 'Actions' */ 'aria-label'?: string;
}
export type ActionBarDividerProps = BaseProps<ViewStyle>;
export interface ActionBarCloseButtonProps extends BaseProps<ViewStyle> { accessibilityLabel?: string }
