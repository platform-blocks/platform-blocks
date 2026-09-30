import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { Keyboard, View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import {
  a11yProps,
  useA11yId,
  useFloating,
  hasDOM,
  isNative,
  isWeb,
  useKeyboardFocusOptional,
  useTheme,
  getControlSize,
  resolveSpacing,
  getLayoutStyles,
  useStyleProps,
  useOverlayMode,
  useDisclaimer,
  DropdownSheet,
  Field,
  Icon,
  getDropdownSurfaceStyle,
  PickerTrigger,
} from '@plocks/ui';
import type {
  A11yProps,
  PlocksTheme,
  FieldHandle,
  FieldBaseProps,
  TextFieldBaseProps,
} from '@plocks/ui';

/** Field props every picker input (date / month / year / time) shares. */
export type PickerFieldBaseProps = FieldBaseProps &
  Pick<
    TextFieldBaseProps,
    | 'placeholder'
    | 'placeholderTextColor'
    | 'clearable'
    | 'clearButtonLabel'
    | 'onClear'
    | 'startSection'
    | 'endSection'
    | 'startSectionProps'
    | 'endSectionProps'
  >;

export interface PickerFieldProps extends PickerFieldBaseProps {
  /** Text in the box (the formatted value); empty shows the placeholder. */
  displayValue: string;
  /** Whether a value is set (shows the clear button when `clearable`). */
  hasValue: boolean;
  opened: boolean;
  onOpenRequest: () => void;
  onCloseRequest: () => void;
  /** Clears the value (the clear button and `ref.clear()`). */
  onClearValue: () => void;
  /**
   * `modal`: a centered sheet with a title (default). `popover`: anchored to
   * the field on desktop web, the sheet on native and small screens.
   */
  dropdownType?: 'modal' | 'popover';
  /** Title of the sheet and accessible name of the popover. */
  panelTitle: string;
  /** Sheet width. */
  panelWidth?: number;
  /** Icon shown at the end of the field (decorative). @default 'calendar' */
  icon?: string;
  /** The picker panel. */
  children: React.ReactNode;
  /** Ref of the field: focus / blur the trigger, clear the value. */
  handleRef?: React.Ref<FieldHandle>;
}

/**
 * Internal: the shared shell of the picker inputs — the `Field` frame, a
 * button trigger showing the formatted value (`aria-haspopup="dialog"`,
 * `aria-expanded`; native announces label then value), a separate labelled
 * clear button, and the panel in the shared `DropdownSheet` (modal) or an
 * anchored `useFloating` dialog (popover, desktop web).
 */
export function PickerField(props: PickerFieldProps) {
  const {
    displayValue,
    hasValue,
    opened,
    onOpenRequest,
    onCloseRequest,
    onClearValue,
    dropdownType = 'modal',
    panelTitle,
    panelWidth,
    icon = 'calendar',
    children,
    handleRef,
    label,
    description,
    error,
    helperText,
    required = false,
    withAsterisk,
    disabled = false,
    readOnly = false,
    size = 'md',
    radius,
    variant = 'default',
    accessibilityLabel,
    accessibilityHint,
    labelProps,
    descriptionProps,
    placeholder,
    placeholderTextColor,
    clearable = false,
    clearButtonLabel = 'Clear',
    onClear,
    startSection,
    endSection,
    startSectionProps,
    endSectionProps,
    onFocus,
    onBlur,
    fullWidth,
    disclaimer,
    disclaimerProps,
    style,
    testID,
  } = props;

  const theme = useTheme();
  const keyboardFocus = useKeyboardFocusOptional();
  const spacingStyles = useStyleProps(props);
  const renderDisclaimer = useDisclaimer(disclaimer, disclaimerProps);
  const { shouldUseModal } = useOverlayMode();
  const useSheet = dropdownType === 'modal' || shouldUseModal;
  const baseId = useA11yId(undefined, 'plocks-picker');
  const panelId = `${baseId}-panel`;
  const triggerRef = useRef<View | null>(null);
  const metrics = getControlSize(theme, size);

  const floating = useFloating({
    opened: opened && !useSheet,
    onDismiss: onCloseRequest,
    placement: 'bottom-start',
    offset: 6,
    boundary: 8,
    role: 'dialog',
    id: panelId,
    layer: 'popover',
    // Keyboard users land in the panel (first control); Escape returns them.
    autoFocus: true,
    initialFocus: 'first-tabbable',
  });
  const { refs: floatingRefs } = floating;

  const setTriggerNode = useCallback(
    (node: View | null) => {
      triggerRef.current = node;
      floatingRefs.setReference(node);
    },
    [floatingRefs]
  );

  const open = useCallback(() => {
    if (disabled || readOnly) return;
    // Another field's keyboard would cover the panel.
    if (keyboardFocus) keyboardFocus.dismissKeyboard();
    else if (isNative) Keyboard.dismiss();
    onOpenRequest();
  }, [disabled, readOnly, keyboardFocus, onOpenRequest]);

  const handlePress = useCallback(() => {
    if (opened) onCloseRequest();
    else open();
  }, [opened, onCloseRequest, open]);

  const handleClear = useCallback(() => {
    if (disabled || readOnly) return;
    onClearValue();
    onClear?.();
    // The clear button unmounts; keep keyboard focus on the field.
    if (isWeb) requestAnimationFrame(() => triggerRef.current?.focus?.());
  }, [disabled, readOnly, onClearValue, onClear]);

  useImperativeHandle(
    handleRef,
    (): FieldHandle => ({
      focus: () => triggerRef.current?.focus?.(),
      blur: () => triggerRef.current?.blur?.(),
      clear: handleClear,
      isFocused: () => hasDOM && document.activeElement === (triggerRef.current as unknown),
    }),
    [handleClear]
  );

  const buildTriggerA11y = (controlProps: A11yProps) => {
    const nameFallback = !label && !accessibilityLabel ? placeholder : undefined;
    return {
      ...controlProps,
      ...(nameFallback && !controlProps['aria-label'] ? { 'aria-label': nameFallback } : null),
      ...a11yProps({
        role: 'button',
        expanded: opened,
        hasPopup: 'dialog',
        controls: opened && !useSheet ? panelId : undefined,
        disabled,
        // Native reads the value after the label ("Birthday, March 3, 2026, button");
        // on web it is the button's text.
        value: !isWeb && displayValue ? { text: displayValue } : undefined,
      }),
      'aria-expanded': opened,
    };
  };

  const surface = getDropdownSurfaceStyle(theme);
  const panelPadding = getPanelPadding(theme);
  const floatingProps = floating.getFloatingProps({
    'aria-label': panelTitle,
    style: [surface, { padding: panelPadding }],
    testID: testID ? `${testID}-popover` : undefined,
  }) as ViewProps;

  const floatingElement = useSheet ? null : floating.renderFloating(<View {...floatingProps}>{children}</View>);

  // `fullWidth` first, so an explicit `w` (in `spacingStyles`) wins.
  const rootStyle: StyleProp<ViewStyle> = [getLayoutStyles({ fullWidth }), spacingStyles, style];

  return (
    <Field
      id={baseId}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={rootStyle}
      testID={testID}
    >
      {({ controlProps, invalid }) => (
        <>
          <View style={ANCHOR_WRAPPER}>
            <PickerTrigger
              triggerRef={setTriggerNode}
              triggerProps={{ ...buildTriggerA11y(controlProps), onFocus, onBlur }}
              onPress={handlePress}
              displayValue={displayValue}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              size={size}
              radius={radius}
              variant={variant}
              opened={opened}
              invalid={invalid}
              disabled={disabled}
              readOnly={readOnly}
              startSection={startSection}
              startSectionProps={startSectionProps}
              endSection={
                endSection ?? (
                  <Icon name={icon} size={metrics.iconSize} color={disabled ? theme.text.disabled : theme.text.muted} decorative />
                )
              }
              endSectionProps={endSectionProps}
              showClear={clearable && hasValue && !disabled && !readOnly}
              onClear={handleClear}
              clearButtonLabel={clearButtonLabel}
              testID={testID ? `${testID}-trigger` : undefined}
            />
            {floatingElement}
          </View>
          {renderDisclaimer()}
          {useSheet ? (
            <DropdownSheet
              opened={opened}
              onClose={onCloseRequest}
              title={panelTitle}
              withCloseButton
              scrollable
              maxWidth={panelWidth}
              testID={testID ? `${testID}-sheet` : undefined}
            >
              <View style={{ padding: panelPadding, paddingTop: 0 }}>{children}</View>
            </DropdownSheet>
          ) : null}
        </>
      )}
    </Field>
  );
}

const ANCHOR_WRAPPER: ViewStyle = { position: 'relative', width: '100%' };

/** DropdownSheet's card border (centered placement). */
const SHEET_BORDER = 1;

const getPanelPadding = (theme: PlocksTheme): number => resolveSpacing(theme, 'md') as number;

/**
 * `panelWidth` that fits a panel of `contentWidth` exactly — the panel padding
 * and card border on both sides — so a fixed-width panel (a calendar) isn't
 * left floating in a wider sheet on phones.
 */
export const getSheetWidthFor = (theme: PlocksTheme, contentWidth: number): number =>
  contentWidth + 2 * (getPanelPadding(theme) + SHEET_BORDER);
