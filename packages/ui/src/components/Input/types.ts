import type React from 'react';
import type { KeyboardTypeOptions, TextInput, TextInputProps as RNTextInputProps, ViewProps } from 'react-native';
import type { WebKeyboardEvent } from '../../core/platform/webProps';
import type { FieldVariant, TextFieldBaseProps } from '../_internal/Field/fieldProps';

/** Values a validation rule compares against (`minLength`: number, `pattern`: RegExp or source string). */
export type ValidationRuleValue = number | string | RegExp;

/**
 * A custom validation check. Parameters are checked bivariantly (the React
 * `EventHandler` trick), so validators typed for a specific value
 * (`(value: string) => boolean`) are accepted.
 */
export type ValidatorFunction = {
  bivarianceHack(value: unknown, formValues?: Record<string, unknown>): boolean | Promise<boolean>;
}['bivarianceHack'];

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'passwordStrength';
  value?: ValidationRuleValue;
  message: string;
  /** Custom check for `type: 'custom'`. */
  validator?: ValidatorFunction;
}

export interface PasswordStrengthRule extends Omit<ValidationRule, 'type'> {
  type: 'passwordStrength';
  requirements: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
  };
}

/** Visual variant of a field: `default` (surface + border), `filled` (subtle fill, no border), `outline` (border only), `unstyled`. */
export type InputVariant = FieldVariant;

/**
 * @deprecated Use `TextFieldBaseProps` (text entry) or `FieldBaseProps` (other
 * controls) from `components/_internal/Field/fieldProps`. Kept as an alias of
 * `TextFieldBaseProps` minus `defaultValue`, so wrappers that declare their own
 * typed `defaultValue` (Date, number, ...) keep extending it.
 */
export type BaseInputProps = Omit<TextFieldBaseProps, 'defaultValue'>;

/** Props forwarded to the underlying `TextInput`, plus the web keyboard events react-native-web exposes. */
export type ExtendedTextInputProps = Omit<RNTextInputProps, keyof TextFieldBaseProps> & {
  /** Style of the TextInput itself, merged after the field's text style. */
  style?: RNTextInputProps['style'];
  onKeyDown?: (event: WebKeyboardEvent) => void;
  onKeyUp?: (event: WebKeyboardEvent) => void;
};

/** Props of the shared text-field shell (`TextInputBase`) that Input, NumberInput, PhoneInput and Search render. */
export interface TextInputBaseProps extends TextFieldBaseProps {
  /** Id of the TextInput (DOM `id` on web, `nativeID` on native); label/error ids derive from it. Generated when omitted. */
  id?: string;
  /** Force the focused look regardless of real focus. */
  focused?: boolean;
  /** Additional TextInput props. */
  textInputProps?: ExtendedTextInputProps;
  /** Extra ref to the TextInput; merged with `ref`. */
  inputRef?: React.Ref<TextInput>;
  /** Force secure entry regardless of type. */
  secureTextEntry?: boolean;
  /** Props for the root `View` (gesture handlers, onLayout, ...). */
  containerProps?: Omit<ViewProps, 'style' | 'testID' | 'children'>;
}

export interface InputProps extends TextInputBaseProps {
  /** Input type - determines styling and behavior */
  type?:
    | 'text'
    | 'password'
    | 'email'
    | 'tel'
    | 'number'
    | 'search';

  /**
   * Validation rules, checked after the field is first blurred and then on
   * every change (debounced by `debounceMs`). The first failing rule's message
   * is shown as the error while no `error` prop is given.
   */
  validation?: ValidationRule[];

  /** Auto-complete type */
  autoComplete?:
    | 'off'
    | 'password'
    | 'email'
    | 'tel'
    | 'url'
    | 'name'
    | 'additional-name'
    | 'address-line1'
    | 'address-line2'
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'country'
    | 'current-password'
    | 'family-name'
    | 'given-name'
    | 'honorific-prefix'
    | 'honorific-suffix'
    | 'new-password'
    | 'one-time-code'
    | 'organization'
    | 'organization-title'
    | 'postal-code'
    | 'street-address'
    | 'username';

  /** Keyboard type for mobile */
  keyboardType?: KeyboardTypeOptions;

  /** Whether input is multiline */
  multiline?: boolean;

  /** Number of lines for multiline input */
  numberOfLines?: number;

  /** Minimum number of lines for multiline input (default: 1) */
  minLines?: number;

  /** Maximum number of lines for multiline input */
  maxLines?: number;

  /** Maximum length */
  maxLength?: number;

  // --- Native TextInput passthrough props ---

  /** Text auto-capitalization behavior */
  autoCapitalize?: RNTextInputProps['autoCapitalize'];

  /** Whether to enable auto-correct */
  autoCorrect?: boolean;

  /** Whether to auto-focus on mount */
  autoFocus?: boolean;

  /** Return key type for soft keyboard */
  returnKeyType?: RNTextInputProps['returnKeyType'];

  /** Whether to blur on submit */
  blurOnSubmit?: boolean;

  /** Select all text on focus */
  selectTextOnFocus?: boolean;

  /** iOS text content type for autofill */
  textContentType?: RNTextInputProps['textContentType'];

  /** Text alignment */
  textAlign?: RNTextInputProps['textAlign'];

  /** Whether spell check is enabled */
  spellCheck?: boolean;

  /** Input mode (modern alternative to keyboardType) */
  inputMode?: RNTextInputProps['inputMode'];

  /** Hint for the enter key */
  enterKeyHint?: RNTextInputProps['enterKeyHint'];

  /** Color of the text selection handles and highlight */
  selectionColor?: string;

  /** Whether to show the soft keyboard on focus */
  showSoftInputOnFocus?: boolean;

  /** Passthrough to the TextInput. Prefer `readOnly`; `editable={false}` behaves the same. */
  editable?: boolean;
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'secureTextEntry'> {
  /** Whether to show password strength indicator */
  showStrengthIndicator?: boolean;

  /** Whether to show toggle visibility button */
  showVisibilityToggle?: boolean;

  /** Password strength validation rules */
  strengthValidation?: PasswordStrengthRule[];
}

