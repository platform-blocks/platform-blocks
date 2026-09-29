import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text as RNText, View, type TextStyle, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { consumeEvent, readKey, type KeyboardEventLike } from '../../core/accessibility/keyboard';
import { useFieldA11y } from '../../core/accessibility/useFieldA11y';
import { factory, withStatics } from '../../core/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { isNative, webProps } from '../../core/platform';
import { getControlSize } from '../../core/theme/tokens';
import { warnOnce } from '../../core/utils/logger';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Checkbox } from '../Checkbox';
import { ChoiceIndicatorProvider } from '../Checkbox/ChoiceField';
import { Radio } from '../Radio';
import { Switch } from '../Switch';
import { Text } from '../Text';
import { FieldHeader } from '../_internal/FieldHeader';
import { ControlFieldGroup } from './ControlFieldGroup';
import { ControlFieldProvider, useControlField, useControlFieldGroup } from './context';
import type {
  ControlFieldContextValue,
  ControlFieldDescriptionProps,
  ControlFieldErrorProps,
  ControlFieldIndicatorProps,
  ControlFieldLabelProps,
  ControlFieldPart,
  ControlFieldProps,
  ControlFieldVariant,
} from './types';

/** Hide a purely-visual node from assistive tech (the row owns the role). */
const DECORATIVE = isNative
  ? ({ accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const)
  : a11yProps({ hidden: true });

const ROLE_FOR: Record<ControlFieldVariant, 'switch' | 'checkbox' | 'radio'> = {
  switch: 'switch',
  checkbox: 'checkbox',
  radio: 'radio',
};

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== '';

/** Registers a compound part with the row while it is mounted. */
function usePartRegistration(part: ControlFieldPart, present: boolean) {
  const { registerPart } = useControlField();
  useEffect(() => {
    if (!present) return undefined;
    registerPart(part, true);
    return () => registerPart(part, false);
  }, [registerPart, part, present]);
}

/** Renders the built-in control for a given variant, wired to field state. */
function renderBuiltInIndicator(ctx: ControlFieldContextValue, variant: ControlFieldVariant) {
  const { checked, disabled, invalid, size, color } = ctx;
  // No visible label here: `error={true}` only tints the control.
  const error = invalid || undefined;

  switch (variant) {
    case 'checkbox':
      return <Checkbox checked={checked} disabled={disabled} size={size} color={color} error={error} />;
    case 'radio':
      return <Radio value="control-field" checked={checked} disabled={disabled} size={size} color={color} error={error} />;
    case 'switch':
    default:
      return <Switch checked={checked} disabled={disabled} size={size} color={color} error={error} />;
  }
}

/**
 * Indicator slot — a built-in control or a custom child. It is only the
 * picture of the state: the row is the control, so the indicator is inert to
 * presses, focus and assistive technology.
 */
const ControlFieldIndicator = React.forwardRef<View, ControlFieldIndicatorProps>(({ variant, children, style, testID }, ref) => {
  const ctx = useControlField();
  const control = children
    ? React.cloneElement(children, {
        // Inject state only when the custom control hasn't set it itself.
        checked: children.props.checked ?? ctx.checked,
        disabled: children.props.disabled ?? ctx.disabled,
      })
    : renderBuiltInIndicator(ctx, variant ?? ctx.variant);

  return (
    <View ref={ref} testID={testID} style={[{ pointerEvents: 'none' }, style]} {...DECORATIVE}>
      <ChoiceIndicatorProvider value>{control}</ChoiceIndicatorProvider>
    </View>
  );
});
ControlFieldIndicator.displayName = 'ControlField.Indicator';

const ControlFieldLabel = ({ children, ...rest }: ControlFieldLabelProps) => {
  const { disabled, required, invalid, size, ids } = useControlField();
  usePartRegistration('label', hasContent(children));
  return (
    <FieldHeader
      label={children}
      required={required}
      withAsterisk
      disabled={disabled}
      error={invalid}
      size={size}
      marginBottom={0}
      labelProps={rest}
      labelId={ids.label}
    />
  );
};
ControlFieldLabel.displayName = 'ControlField.Label';

const ControlFieldDescription = React.forwardRef<RNText, ControlFieldDescriptionProps>(({ children, ...rest }, ref) => {
  const { ids } = useControlField();
  usePartRegistration('description', hasContent(children));
  const styles = useThemedStyles((theme) => ({
    description: { fontSize: 12, color: theme.text.muted, marginTop: 2 } as TextStyle,
  }));
  return (
    <Text ref={ref} selectable={false} {...mergeSlotProps({ style: styles.description, id: ids.description }, rest)}>
      {children}
    </Text>
  );
});
ControlFieldDescription.displayName = 'ControlField.Description';

const ControlFieldError = React.forwardRef<RNText, ControlFieldErrorProps>(({ children, ...rest }, ref) => {
  const { invalid, ids } = useControlField();
  const shown = invalid && hasContent(children);
  usePartRegistration('error', shown);
  const styles = useThemedStyles((theme) => ({
    error: { color: theme.colors.error[5], marginTop: 4, fontSize: 12 } as TextStyle,
  }));
  if (!shown) return null;
  return (
    // A polite alert region, so a newly shown error is announced.
    <View id={ids.error} role="alert" aria-live="polite" accessible>
      <Text ref={ref} size="sm" selectable={false} {...mergeSlotProps({ style: styles.error }, rest)}>
        {children}
      </Text>
    </View>
  );
});
ControlFieldError.displayName = 'ControlField.Error';

const DEPRECATED_PROPS = [
  ['isSelected', 'checked'],
  ['defaultSelected', 'defaultChecked'],
  ['onSelectedChange', 'onChange'],
  ['isDisabled', 'disabled'],
  ['isRequired', 'required'],
  ['isInvalid', 'error'],
] as const;

const ControlFieldBase = factory<{ props: ControlFieldProps; ref: View }>((props, ref) => {
  const {
    checked,
    isSelected,
    defaultChecked,
    defaultSelected,
    onChange,
    onSelectedChange,
    disabled,
    isDisabled,
    required,
    isRequired,
    isInvalid,
    variant = 'switch',
    label,
    description,
    error,
    color,
    size: sizeProp,
    indicatorPosition = 'right',
    control,
    labelProps,
    descriptionProps,
    children,
    testID,
    style,
    accessibilityLabel,
    accessibilityHint,
    id,
  } = props;

  for (const [legacy, canonical] of DEPRECATED_PROPS) {
    if (props[legacy] !== undefined) {
      warnOnce(
        `ControlField.${legacy}`,
        `[ControlField] \`${legacy}\` is deprecated and will be removed; use \`${canonical}\` instead.`
      );
    }
  }

  const group = useControlFieldGroup();
  const size = sizeProp ?? group?.size ?? 'md';
  const spacingStyles = useStyleProps(props);

  // Canonical props win over their deprecated aliases.
  const resolvedDisabled = disabled ?? isDisabled ?? false;
  const resolvedRequired = required ?? isRequired ?? false;
  const invalid = isInvalid ?? (error === true || hasContent(error));
  const errorMessage = invalid && hasContent(error) ? error : undefined;

  const [isChecked, setChecked] = useControllableState<boolean>({
    value: checked ?? isSelected,
    defaultValue: defaultChecked ?? defaultSelected ?? false,
    finalValue: false,
    onChange: onChange ?? onSelectedChange,
  });

  const toggle = useCallback(() => {
    if (resolvedDisabled) return;
    setChecked((previous) => !previous);
  }, [resolvedDisabled, setChecked]);

  // Space toggles the row; react-native-web's Pressable only presses on Enter
  // for non-button roles.
  const handleKeyDown = useCallback(
    (event: KeyboardEventLike) => {
      const { key } = readKey(event);
      if (key !== ' ' && key !== 'Spacebar') return;
      consumeEvent(event);
      toggle();
    },
    [toggle]
  );

  const compound = children != null;
  const a11y = useFieldA11y({
    id,
    // Compound parts are wired through registration below.
    label: compound ? undefined : label,
    description: compound ? undefined : description,
    error: compound ? undefined : errorMessage,
    invalid,
    required: resolvedRequired,
    disabled: resolvedDisabled,
    accessibilityLabel,
    accessibilityHint,
  });
  const { ids } = a11y;

  const [parts, setParts] = useState<Record<ControlFieldPart, boolean>>({
    label: false,
    description: false,
    error: false,
  });
  const registerPart = useCallback((part: ControlFieldPart, present: boolean) => {
    setParts((current) => (current[part] === present ? current : { ...current, [part]: present }));
  }, []);

  const setSelected = useCallback(
    (next: boolean) => {
      if (resolvedDisabled) return;
      setChecked(next);
    },
    [resolvedDisabled, setChecked]
  );

  const ctx = useMemo<ControlFieldContextValue>(
    () => ({
      checked: isChecked,
      onChange: setSelected,
      disabled: resolvedDisabled,
      invalid,
      required: resolvedRequired,
      size,
      color,
      variant,
      ids: { control: ids.control, label: ids.label, description: ids.description, error: ids.error },
      registerPart,
      isSelected: isChecked,
      onSelectedChange: setSelected,
      isDisabled: resolvedDisabled,
      isInvalid: invalid,
      isRequired: resolvedRequired,
    }),
    [isChecked, setSelected, resolvedDisabled, invalid, resolvedRequired, size, color, variant, ids, registerPart]
  );

  const styles = useThemedStyles(
    (theme) => ({
      row: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' } as ViewStyle,
      rowDisabled: { opacity: 0.6 } as ViewStyle,
      labelBlock: { flex: 1, minWidth: 0 } as ViewStyle,
      // The whole row is the tap target; the indicator must not intercept presses.
      indicator: { flexShrink: 0 } as ViewStyle,
      description: { fontSize: 12, color: theme.text.muted, marginTop: 2 } as TextStyle,
      error: {
        color: theme.colors.error[5],
        marginTop: 4,
        fontSize: Math.max(10, getControlSize(theme, size).fontSize - 2),
        fontFamily: theme.fontFamily,
      } as TextStyle,
    }),
    [size]
  );

  // Compound mode: children replace the built-in layout. Error children render
  // below the pressable row, everything else inside it.
  let rowContent: React.ReactNode;
  let errorContent: React.ReactNode = null;

  if (compound) {
    const rowChildren: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === ControlFieldError) {
        errorContent = child;
      } else {
        rowChildren.push(child);
      }
    });
    rowContent = rowChildren;
  } else {
    const labelBlock = (
      <View style={styles.labelBlock} key="label">
        {hasContent(label) ? (
          <FieldHeader
            label={label}
            required={resolvedRequired}
            withAsterisk
            disabled={resolvedDisabled}
            error={invalid}
            size={size}
            marginBottom={0}
            labelProps={labelProps}
            labelId={ids.label}
          />
        ) : null}
        {hasContent(description) ? (
          <Text
            selectable={false}
            {...mergeSlotProps({ style: styles.description, id: ids.description }, descriptionProps)}
          >
            {description}
          </Text>
        ) : null}
      </View>
    );

    const indicator = (
      <View style={styles.indicator} key="indicator">
        <ControlFieldIndicator>{control}</ControlFieldIndicator>
      </View>
    );

    // `row` follows the reading direction on both platforms, so `left` means start.
    rowContent = indicatorPosition === 'left' ? [indicator, labelBlock] : [labelBlock, indicator];

    errorContent = errorMessage ? (
      <View {...a11y.errorProps} accessible>
        <RNText style={styles.error}>{errorMessage}</RNText>
      </View>
    ) : null;
  }

  const compoundLinks = compound
    ? a11yProps({
        labelledBy: parts.label ? ids.label : undefined,
        describedBy: [parts.description && ids.description, parts.error && ids.error],
      })
    : null;

  return (
    <ControlFieldProvider value={ctx}>
      <View style={spacingStyles}>
        <Pressable
          ref={ref}
          onPress={toggle}
          disabled={resolvedDisabled}
          testID={testID}
          hitSlop={4}
          {...a11y.controlProps}
          {...compoundLinks}
          {...a11yProps({ role: ROLE_FOR[variant], checked: isChecked })}
          {...webProps({ onKeyDown: resolvedDisabled ? undefined : handleKeyDown })}
          style={[styles.row, resolvedDisabled && styles.rowDisabled, style]}
        >
          {rowContent}
        </Pressable>
        {errorContent}
      </View>
    </ControlFieldProvider>
  );
}, { displayName: 'ControlField' });

ControlFieldBase.displayName = 'ControlField';

export const ControlField = withStatics(ControlFieldBase, {
  Label: ControlFieldLabel,
  Description: ControlFieldDescription,
  Indicator: ControlFieldIndicator,
  Error: ControlFieldError,
  Group: ControlFieldGroup,
});

export type ControlFieldComponent = typeof ControlField;
