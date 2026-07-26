import { ViewStyle, StyleProp } from 'react-native';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { TooltipPropValue } from '../Tooltip';

export interface CopyButtonProps {
  /** The text to copy to clipboard */
  value: string;
  /** Callback fired after copy action */
  onCopy?: (value: string) => void;
  /** If true, only the icon is shown (no button chrome or label) */
  iconOnly?: boolean;
  /** Accessible label for the button */
  label?: string;
  /** Title for the toast */
  toastTitle?: string;
  /** Detailed message for the toast */
  toastMessage?: string;
  /** Visual size token */
  size?: ComponentSizeValue;
  /** Style overrides for the button container */
  style?: StyleProp<ViewStyle>;
  /** Disable the "copied to clipboard" toast */
  disableToast?: boolean;
  /** Tooltip text, or a full Tooltip config (`{ label, maxWidth, … }`) */
  tooltip?: TooltipPropValue;
  /** Tooltip position when the string form of `tooltip` is used */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Presentation mode: default button (legacy) or bare icon */
  mode?: 'button' | 'icon';
  /** Button variant override when in button mode */
  buttonVariant?: 'none' | 'secondary' | 'ghost' | 'filled' | 'outline' | 'gradient' | undefined;
  /** Icon name to display (defaults to copy) when in icon mode */
  iconName?: string;
  /** Icon name to display after copy (default check) in icon mode */
  copiedIconName?: string;
  /** Base icon color (icon mode) */
  iconColor?: string;
  /** Copied state icon color (icon mode) */
  copiedIconColor?: string;
}
