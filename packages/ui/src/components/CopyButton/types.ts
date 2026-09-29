import type { ViewStyle } from 'react-native';

import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { TooltipPropValue } from '../Tooltip';

export type CopyButtonVariant = 'none' | 'default' | 'secondary' | 'ghost' | 'filled' | 'outline' | 'gradient';

export interface CopyButtonProps extends BaseProps<ViewStyle> {
  /** The text to copy to clipboard */
  value: string;
  /** Called with the value once it has been copied (not when copying failed) */
  onCopy?: (value: string) => void;
  /** Called when copying failed (no clipboard access, permission denied, …) */
  onCopyError?: (error: Error) => void;
  /**
   * Icon-only control (the default). `false` renders a button with the icon and
   * the `label` text.
   * @default true
   */
  iconOnly?: boolean;
  /** Accessible name (and visible text when `iconOnly={false}`). @default 'Copy' */
  label?: string;
  /** Label / announcement once the value is copied. @default 'Copied' */
  copiedLabel?: string;
  /** Title for the toast (web) */
  toastTitle?: string;
  /** Detailed message for the toast (web) */
  toastMessage?: string;
  /** Visual size token, or the control height in px */
  size?: ComponentSizeValue;
  /** Disable the "copied to clipboard" toast (the copy is then announced to screen readers instead) */
  disableToast?: boolean;
  /** Tooltip text, or a full Tooltip config (`{ label, maw, … }`). Icon-only controls default to the label. */
  tooltip?: TooltipPropValue;
  /** Tooltip position when the string form of `tooltip` is used */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Presentation: a button (default) or a bare icon with no chrome */
  mode?: 'button' | 'icon';
  /** Button variant in button mode */
  buttonVariant?: CopyButtonVariant;
  /** Icon name to display (defaults to copy) */
  iconName?: string;
  /** Icon name to display after copy (default check) */
  copiedIconName?: string;
  /** Base icon color */
  iconColor?: ColorProp;
  /** Copied state icon color (default: the success palette) */
  copiedIconColor?: ColorProp;
}
