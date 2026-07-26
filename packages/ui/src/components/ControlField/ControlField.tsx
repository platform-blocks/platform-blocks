import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, Platform, type Text as RNText } from 'react-native';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { useDirection } from '../../core/providers/DirectionProvider';
import { extractSpacingProps, getSpacingStyles, mergeSlotProps } from '../../core/utils';
import { Text } from '../Text';
import { FieldHeader } from '../_internal/FieldHeader';
import { Checkbox } from '../Checkbox';
import { Switch } from '../Switch';
import { Radio } from '../Radio';
import { ControlFieldProvider, useControlField, useControlFieldGroup } from './context';
import { ControlFieldGroup } from './ControlFieldGroup';
import { useControlFieldStyles } from './styles';
import { useControllableState } from '../../hooks/useControllableState';
import type {
  ControlFieldContextValue,
  ControlFieldDescriptionProps,
  ControlFieldErrorProps,
  ControlFieldIndicatorProps,
  ControlFieldLabelProps,
  ControlFieldProps,
  ControlFieldVariant,
} from './types';

/** Hide a purely-visual node from assistive tech (the row owns the a11y role). */
const decorativeProps =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({ accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const);

/** Renders the built-in control for a given variant, wired to field state. */
function renderBuiltInIndicator(ctx: ControlFieldContextValue) {
  const { isSelected, isDisabled, isInvalid, size, color, colorVariant, variant } = ctx;
  // Checkbox/Switch tint their box/border red when `error` is a non-empty
  // string; there is no visible label here, so a single space triggers the
  // invalid styling without rendering any error text.
  const invalidFlag = isInvalid ? ' ' : undefined;

  switch (variant) {
    case 'checkbox':
      return (
        <Checkbox
          checked={isSelected}
          disabled={isDisabled}
          size={size}
          color={color as any}
          colorVariant={colorVariant}
          error={invalidFlag}
        />
      );
    case 'radio':
      return (
        <Radio
          value="control-field"
          checked={isSelected}
          disabled={isDisabled}
          size={size}
          color={color as any}
          error={invalidFlag}
        />
      );
    case 'switch':
    default:
      return (
        <Switch
          checked={isSelected}
          disabled={isDisabled}
          size={size}
          color={color as any}
          error={invalidFlag}
        />
      );
  }
}

/** Indicator slot — a built-in control or a custom child, kept press-inert. */
const ControlFieldIndicator = React.forwardRef<View, ControlFieldIndicatorProps>(({ variant, children, style }, ref) => {
  const ctx = useControlField();
  const effectiveCtx = variant ? { ...ctx, variant } : ctx;

  const customControl = children as React.ReactElement<any> | undefined;
  const control = customControl
    ? React.cloneElement(customControl, {
        // Inject state only when the custom control hasn't set it itself.
        checked: customControl.props.checked ?? ctx.isSelected,
        disabled: customControl.props.disabled ?? ctx.isDisabled,
      })
    : renderBuiltInIndicator(effectiveCtx);

  return (
    <View ref={ref} pointerEvents="none" style={style} {...decorativeProps}>
      {control}
    </View>
  );
});
ControlFieldIndicator.displayName = 'ControlField.Indicator';

const ControlFieldLabel: React.FC<ControlFieldLabelProps> = ({ children, ...rest }) => {
  const { isDisabled, isRequired, isInvalid, size } = useControlField();
  return (
    <FieldHeader
      label={children}
      required={isRequired}
      withAsterisk
      disabled={isDisabled}
      error={isInvalid}
      size={size as any}
      marginBottom={0}
      labelProps={rest}
    />
  );
};
ControlFieldLabel.displayName = 'ControlField.Label';

const ControlFieldDescription = React.forwardRef<RNText, ControlFieldDescriptionProps>(({ children, ...rest }, ref) => {
  const theme = useTheme();
  return (
    <Text
      ref={ref}
      selectable={false}
      {...mergeSlotProps({ style: { fontSize: 12, color: theme.text.muted, marginTop: 2 } }, rest)}
    >
      {children}
    </Text>
  );
});
ControlFieldDescription.displayName = 'ControlField.Description';

const ControlFieldError = React.forwardRef<RNText, ControlFieldErrorProps>(({ children, ...rest }, ref) => {
  const theme = useTheme();
  const { isInvalid } = useControlField();
  if (!isInvalid || !children) return null;
  return (
    <Text
      ref={ref}
      size="sm"
      selectable={false}
      {...mergeSlotProps({ style: { color: theme.colors.error[6], marginTop: 4, fontSize: 12 } }, rest)}
    >
      {children}
    </Text>
  );
});
ControlFieldError.displayName = 'ControlField.Error';

const ControlFieldBase = factory<{ props: ControlFieldProps; ref: View }>((rawProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(rawProps);
  const spacingStyles = getSpacingStyles(spacingProps);

  const {
    isSelected,
    checked,
    defaultSelected = false,
    onSelectedChange,
    onChange,
    isDisabled,
    disabled,
    isInvalid,
    isRequired,
    required,
    variant = 'switch',
    label,
    description,
    error,
    color,
    colorVariant,
    size: sizeProp,
    indicatorPosition = 'right',
    control,
    labelProps,
    descriptionProps,
    children,
    testID,
    style,
    accessibilityLabel,
  } = otherProps as ControlFieldProps;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const group = useControlFieldGroup();
  const size = sizeProp ?? group?.size ?? 'md';
  const styles = useControlFieldStyles(theme);

  const controlledSelected = isSelected ?? checked;
  const resolvedDisabled = isDisabled ?? disabled ?? false;
  const resolvedRequired = isRequired ?? required ?? false;
  const resolvedInvalid = isInvalid ?? !!error;
  const handleChange = onSelectedChange ?? onChange;

  const [effectiveSelected, setSelected] = useControllableState<boolean>({
    value: controlledSelected,
    defaultValue: defaultSelected,
    finalValue: false,
    onChange: handleChange,
  });

  const handlePress = useCallback(() => {
    if (resolvedDisabled) return;
    setSelected((previous) => !previous);
  }, [resolvedDisabled, setSelected]);

  const ctx: ControlFieldContextValue = useMemo(
    () => ({
      isSelected: effectiveSelected,
      onSelectedChange: (next: boolean) => {
        if (resolvedDisabled) return;
        setSelected(next);
      },
      isDisabled: resolvedDisabled,
      isInvalid: resolvedInvalid,
      isRequired: resolvedRequired,
      size,
      color,
      colorVariant,
      variant,
    }),
    [effectiveSelected, resolvedDisabled, resolvedInvalid, resolvedRequired, size, color, colorVariant, variant, setSelected]
  );

  // Compound mode: children replace the built-in layout. Error children render
  // below the pressable row, everything else inside it.
  let rowContent: React.ReactNode;
  let errorContent: React.ReactNode = null;

  if (children != null) {
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
        {(label != null || description != null) ? (
          <>
            <FieldHeader
              label={label}
              required={resolvedRequired}
              withAsterisk
              disabled={resolvedDisabled}
              error={resolvedInvalid}
              size={size as any}
              marginBottom={0}
              labelProps={labelProps}
            />
            {description != null ? (
              <Text
                selectable={false}
                {...mergeSlotProps(
                  { style: { fontSize: 12, color: theme.text.muted, marginTop: 2 } },
                  descriptionProps
                )}
              >
                {description}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    );

    const indicator = (
      <View style={styles.indicator} key="indicator">
        <ControlFieldIndicator>{control}</ControlFieldIndicator>
      </View>
    );

    // Resolve visual side, honoring RTL.
    const showIndicatorLeft = isRTL ? indicatorPosition === 'right' : indicatorPosition === 'left';
    rowContent = showIndicatorLeft ? [indicator, labelBlock] : [labelBlock, indicator];

    errorContent =
      resolvedInvalid && error ? (
        <Text style={styles.error} size="sm" selectable={false}>
          {error}
        </Text>
      ) : null;
  }

  const accessibilityRole = variant === 'switch' ? 'switch' : variant === 'radio' ? 'radio' : 'checkbox';
  const resolvedA11yLabel =
    accessibilityLabel ?? (typeof label === 'string' ? label : undefined);

  return (
    <ControlFieldProvider value={ctx}>
      <View style={spacingStyles}>
        <Pressable
          ref={ref}
          onPress={handlePress}
          disabled={resolvedDisabled}
          testID={testID}
          hitSlop={4}
          accessibilityRole={accessibilityRole as any}
          accessibilityState={{ checked: effectiveSelected, disabled: resolvedDisabled }}
          accessibilityLabel={resolvedA11yLabel}
          style={[styles.row, resolvedDisabled && { opacity: 0.6 }, style]}
        >
          {rowContent}
        </Pressable>
        {errorContent}
      </View>
    </ControlFieldProvider>
  );
}, { displayName: 'ControlField' });

export const ControlField = Object.assign(ControlFieldBase, {
  Label: ControlFieldLabel,
  Description: ControlFieldDescription,
  Indicator: ControlFieldIndicator,
  Error: ControlFieldError,
  Group: ControlFieldGroup,
});

export type ControlFieldComponent = typeof ControlField;
