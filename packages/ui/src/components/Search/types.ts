import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { SizeValue } from '../../core/theme/types';
import type { BaseProps, RadiusValue } from '../../core/types/base';

export interface SearchProps extends BaseProps<ViewStyle> {
  /** Controlled query. */
  value?: string;
  /** Initial query while uncontrolled. */
  defaultValue?: string;
  /** Called with the query as the user types (after `debounce` ms when set). */
  onChangeText?: (value: string) => void;
  /** Called with the query on Enter, and with `''` when cleared. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  size?: SizeValue;
  radius?: RadiusValue;
  autoFocus?: boolean;
  /** Delay (ms) before `onChangeText` fires; typing still shows immediately. */
  debounce?: number;
  /** Show a clear button while there is a query. Default true. */
  clearButton?: boolean;
  /** Accessible name of the clear button. Default `'Clear search'`. */
  clearButtonLabel?: string;
  /** Show a loading indicator in place of the clear button. */
  loading?: boolean;
  endSection?: React.ReactNode;
  /** Accessible name of the field (or the button in `buttonMode`). Default `'Search'`. */
  accessibilityLabel?: string;
  disabled?: boolean;
  /** When true, renders as a button (e.g. a Spotlight launcher) instead of a typeable input */
  buttonMode?: boolean;
  /** Called when the button is pressed (buttonMode only) */
  onPress?: () => void;
  /** Component to render on the right side (useful for button mode to show shortcuts like CMD+K) */
  rightComponent?: React.ReactNode;
}
