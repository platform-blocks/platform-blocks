import React from 'react';
import { TextInputProps, TextInputProps as RNTextInputProps } from 'react-native';
import { BaseInputProps } from '../Input/types';

export interface PinInputProps extends Omit<BaseInputProps, 'value' | 'onChangeText'> {
  /** Number of PIN digits */
  length?: number;
  
  /** Stable id used by KeyboardManager to restore focus */
  keyboardFocusId?: string;
  
  /** PIN value (controlled) */
  value?: string;

  /** Uncontrolled initial value (used when `value` is not provided) */
  defaultValue?: string;

  /** Change handler */
  onChange?: (pin: string) => void;
  
  /** Whether to mask PIN */
  mask?: boolean;
  
  /** Character to use for masking */
  maskChar?: string;
  
  /** Whether to focus next input automatically */
  manageFocus?: boolean;

  /** Enforce sequential entry (forces focus to first empty). If false, user can edit any position after complete */
  enforceOrderInitialOnly?: boolean;
  
  /** Type of input */
  type?: 'alphanumeric' | 'numeric';
  
  /** Placeholder for each input */
  placeholder?: string;
  
  /** Whether to allow paste */
  allowPaste?: boolean;
  
  /** One-time code auto-complete */
  oneTimeCode?: boolean;
  
  /** Input spacing */
  spacing?: number;
  
  /** Input border radius */
  borderRadius?: number;
  
  /** Complete handler - called when all digits are filled */
  onComplete?: (pin: string) => void;
  
  /** Additional TextInput props for each input */
  textInputProps?: Omit<TextInputProps, keyof BaseInputProps>;

  // --- Native TextInput passthrough props ---

  /** Text auto-capitalization behavior */
  autoCapitalize?: RNTextInputProps['autoCapitalize'];

  /** Whether to enable auto-correct */
  autoCorrect?: boolean;

  /** Whether to auto-focus on first input on mount */
  autoFocus?: boolean;

  /** Select all text on focus */
  selectTextOnFocus?: boolean;

  /** iOS text content type for autofill */
  textContentType?: RNTextInputProps['textContentType'];

  /** Text alignment */
  textAlign?: RNTextInputProps['textAlign'];

  /** Whether spell check is enabled */
  spellCheck?: boolean;

  /** Color of the text selection handles and highlight */
  selectionColor?: string;

  /** Whether to show the soft keyboard on focus */
  showSoftInputOnFocus?: boolean;
}

export interface PinInputStyleProps {
  error?: boolean;
  disabled?: boolean;
  focused?: boolean;
  size: string;
  length: number;
}
