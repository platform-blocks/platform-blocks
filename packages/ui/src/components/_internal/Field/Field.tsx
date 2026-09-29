import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Text as RNText, View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from 'react-native';

import type { A11yProps } from '../../../core/accessibility/a11yProps';
import { announce } from '../../../core/accessibility/announce';
import { getNodeText } from '../../../core/accessibility/useA11yId';
import { useFieldA11y, type FieldA11yIds } from '../../../core/accessibility/useFieldA11y';
import { useThemedStyles } from '../../../core/hooks/useThemedStyles';
import { isIOS } from '../../../core/platform';
import type { SizeValue } from '../../../core/theme/types';
import type { TextProps } from '../../Text';
import { FieldHeader } from '../FieldHeader';
import { getFieldLabelFontSize } from './fieldFrameStyles';

/** What a field's control needs from the frame. */
export interface FieldRenderProps {
  /** Spread on the focusable control: id, aria-labelledby/describedby (web), composed label/hint (native), aria-invalid/required. */
  controlProps: A11yProps;
  invalid: boolean;
  ids: FieldA11yIds;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  size: SizeValue;
}

export type FieldLabelPosition = 'top' | 'start' | 'end';

export interface FieldProps {
  /** Base id for the control (`${id}-label`, `${id}-error`, ... for the parts). Generated when omitted. */
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error message (rendered, announced, marks the control invalid). `true` marks invalid without a message. */
  error?: React.ReactNode;
  /** Shown under the control when there is no error. */
  helperText?: React.ReactNode;
  required?: boolean;
  /** Show the visual asterisk for required fields. Default: `required`. */
  withAsterisk?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: SizeValue;
  /**
   * `top` (default) stacks label/description above the control. `start` / `end`
   * put them beside the control (checkbox, switch, radio rows); logical, so they
   * follow the reading direction.
   */
  labelPosition?: FieldLabelPosition;
  /** Explicit accessible name for the control (replaces the label reference). */
  accessibilityLabel?: string;
  /** Extra native hint for the control. */
  accessibilityHint?: string;
  labelProps?: Omit<TextProps, 'children'>;
  descriptionProps?: Omit<TextProps, 'children'>;
  /**
   * The control. A render function receives the wiring directly; plain children
   * can read it with `useFieldContext()`.
   */
  children: React.ReactNode | ((field: FieldRenderProps) => React.ReactNode);
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Extra props for the root `View` (gesture handlers, onLayout, ...). */
  containerProps?: Omit<ViewProps, 'style' | 'testID' | 'children'>;
  /** Ref to the root `View` (for fields whose ref is their root rather than a TextInput). */
  rootRef?: React.Ref<View>;
}

const FieldContext = createContext<FieldRenderProps | null>(null);
FieldContext.displayName = 'FieldContext';

/**
 * The wiring of the nearest `Field` (controlProps, ids, invalid, ...), or null
 * when the control isn't inside one — controls then fall back to their own props.
 *
 * @example
 * const field = useFieldContext();
 * <TextInput {...field?.controlProps} />
 */
export function useFieldContext(): FieldRenderProps | null {
  return useContext(FieldContext);
}

/**
 * Hides the enclosing `Field` from its subtree, so a control rendered inside a
 * field's own chrome (a section, a dropdown) doesn't adopt the field's ids.
 *
 * @example
 * <FieldBoundary>{endSection}</FieldBoundary>
 */
export function FieldBoundary({ children }: { children?: React.ReactNode }) {
  return <FieldContext.Provider value={null}>{children}</FieldContext.Provider>;
}

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== '';

/**
 * Internal form-field frame: label + description (FieldHeader), the control,
 * and an error / helper-text footer, all wired through `useFieldA11y`. Every
 * form field renders through it.
 *
 * @example
 * <Field label="Email" required error={error} helperText="We never share it">
 *   {({ controlProps }) => <TextInput {...controlProps} />}
 * </Field>
 */
export function Field({
  id,
  label,
  description,
  error,
  helperText,
  required = false,
  withAsterisk,
  disabled = false,
  readOnly = false,
  size = 'md',
  labelPosition = 'top',
  accessibilityLabel,
  accessibilityHint,
  labelProps,
  descriptionProps,
  children,
  style,
  testID,
  containerProps,
  rootRef,
}: FieldProps) {
  const a11y = useFieldA11y({
    id,
    label,
    description,
    error,
    helperText,
    required,
    disabled,
    readOnly,
    accessibilityLabel,
    accessibilityHint,
  });

  const styles = useThemedStyles((theme) => {
    const footerFontSize = Math.max(10, getFieldLabelFontSize(theme, size) - 1);
    return {
      root: { width: '100%' } as ViewStyle,
      row: { flexDirection: 'row', alignItems: 'center', gap: 8 } as ViewStyle,
      headerBeside: { flexShrink: 1 } as ViewStyle,
      footer: { marginTop: 4 } as ViewStyle,
      error: { color: theme.colors.error[5], fontSize: footerFontSize, fontFamily: theme.fontFamily } as TextStyle,
      helper: { color: theme.text.muted, fontSize: footerFontSize, fontFamily: theme.fontFamily } as TextStyle,
    };
  }, [size]);

  const { controlProps, ids, invalid, showError, showHelper } = a11y;

  // Live regions are Android/web only: on iOS, speak a newly shown error.
  const errorText = showError && isIOS ? getNodeText(error) : '';
  useEffect(() => {
    if (errorText) announce(errorText);
  }, [errorText]);

  const renderProps = useMemo<FieldRenderProps>(
    () => ({ controlProps, invalid, ids, disabled, required, readOnly, size }),
    [controlProps, invalid, ids, disabled, required, readOnly, size]
  );

  const header = (
    <FieldHeader
      label={label}
      description={description}
      required={required}
      withAsterisk={withAsterisk ?? required}
      disabled={disabled}
      error={invalid}
      size={size}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      labelId={hasContent(label) ? ids.label : undefined}
      descriptionId={hasContent(description) ? ids.description : undefined}
      marginBottom={labelPosition === 'top' ? undefined : 0}
    />
  );

  const control = typeof children === 'function' ? children(renderProps) : children;

  // Footer: the error replaces helper text while present. The error container is
  // always a live region with role="alert" so a newly shown error is announced.
  const footer = showError ? (
    // `accessible` groups the message into one native node (ignored on web).
    <View {...a11y.errorProps} accessible style={styles.footer}>
      <RNText style={styles.error}>{error}</RNText>
    </View>
  ) : showHelper ? (
    <View id={a11y.helperProps.id} style={styles.footer}>
      <RNText style={styles.helper}>{helperText}</RNText>
    </View>
  ) : null;

  const body =
    labelPosition === 'top' ? (
      <>
        {header}
        {control}
      </>
    ) : (
      // `row` already follows the reading direction on both platforms (RTL flips
      // it). DOM order matches visual order, so reading/tab order stays meaningful.
      <View style={styles.row}>
        {labelPosition === 'start' ? <View style={styles.headerBeside}>{header}</View> : null}
        {control}
        {labelPosition === 'end' ? <View style={styles.headerBeside}>{header}</View> : null}
      </View>
    );

  return (
    <FieldContext.Provider value={renderProps}>
      <View {...containerProps} ref={rootRef} style={[styles.root, style]} testID={testID}>
        {body}
        {footer}
      </View>
    </FieldContext.Provider>
  );
}

Field.displayName = 'Field';

export default Field;
