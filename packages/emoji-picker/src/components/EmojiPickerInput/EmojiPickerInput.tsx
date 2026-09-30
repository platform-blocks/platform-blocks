import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import type { ViewProps, ViewStyle } from 'react-native';

import {
  a11yProps,
  DropdownSheet,
  factory,
  Field,
  getControlSize,
  getLayoutStyles,
  hasDOM,
  Icon,
  isNative,
  isWeb,
  PickerTrigger,
  useA11yId,
  useControllableState,
  useDisclaimer,
  useFloating,
  useKeyboardFocusOptional,
  useOverlayMode,
  useStyleProps,
  useTheme,
} from '@plocks/ui';
import { EmojiPicker } from '../EmojiPicker';
import type { EmojiPickerSelection } from '../EmojiPicker';
import type { EmojiPickerInputHandle, EmojiPickerInputProps } from './types';

const ANCHOR_STYLE: ViewStyle = { position: 'relative', width: '100%' };

/** A form field that opens the searchable emoji picker. */
export const EmojiPickerInput = factory<{ props: EmojiPickerInputProps; ref: EmojiPickerInputHandle }>(
  function EmojiPickerInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      onSelect,
      pickerProps,
      closeOnSelect = true,
      dropdownType = 'popover',
      modalTitle = 'Select emoji',
      onOpen,
      onClose,
      placeholder = 'Select emoji',
      placeholderTextColor,
      clearable = false,
      clearButtonLabel = 'Clear emoji',
      onClear,
      startSection,
      endSection,
      startSectionProps,
      endSectionProps,
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
    const { shouldUseModal } = useOverlayMode();
    const useSheet = dropdownType === 'modal' || shouldUseModal;
    const styles = useStyleProps(props);
    const renderDisclaimer = useDisclaimer(disclaimer, disclaimerProps);
    const [selected, setSelected] = useControllableState<string | null>({
      value,
      defaultValue: defaultValue ?? null,
      finalValue: null,
      onChange,
    });
    const [opened, setOpened] = useState(false);
    const triggerRef = useRef<View | null>(null);
    const fieldId = useA11yId(undefined, 'plocks-emoji-input');
    const panelId = `${fieldId}-panel`;
    const metrics = getControlSize(theme, size);

    const close = useCallback(() => {
      if (!opened) return;
      setOpened(false);
      onClose?.();
    }, [opened, onClose]);

    const open = useCallback(() => {
      if (disabled || readOnly || opened) return;
      if (keyboardFocus) keyboardFocus.dismissKeyboard();
      else if (isNative) Keyboard.dismiss();
      setOpened(true);
      onOpen?.();
    }, [disabled, readOnly, opened, keyboardFocus, onOpen]);

    const floating = useFloating({
      opened: opened && !useSheet,
      onDismiss: close,
      placement: 'bottom-start',
      offset: 6,
      boundary: 8,
      role: 'dialog',
      id: panelId,
      layer: 'popover',
      autoFocus: true,
      initialFocus: 'first-tabbable',
    });
    const setTriggerNode = useCallback((node: View | null) => {
      triggerRef.current = node;
      floating.refs.setReference(node);
    }, [floating.refs]);

    const clear = useCallback(() => {
      if (disabled || readOnly) return;
      setSelected(null, null);
      onClear?.();
      close();
      if (isWeb) requestAnimationFrame(() => triggerRef.current?.focus?.());
    }, [disabled, readOnly, setSelected, onClear, close]);

    useImperativeHandle(ref, () => ({
      focus: () => triggerRef.current?.focus?.(),
      blur: () => triggerRef.current?.blur?.(),
      clear,
      isFocused: () => hasDOM && document.activeElement === (triggerRef.current as unknown),
    }), [clear]);

    const handleSelect = useCallback((selection: EmojiPickerSelection) => {
      setSelected(selection.emoji, selection);
      onSelect?.(selection);
      if (closeOnSelect) close();
    }, [setSelected, onSelect, closeOnSelect, close]);

    const picker = (
      <EmojiPicker
        {...pickerProps}
        onSelect={handleSelect}
        style={[{ width: '100%', height: 420 }, pickerProps?.style]}
        testID={testID ? `${testID}-picker` : pickerProps?.testID}
      />
    );
    const floatingProps = floating.getFloatingProps({
      'aria-label': modalTitle,
      style: { width: 352, maxWidth: '100%' },
      testID: testID ? `${testID}-popover` : undefined,
    }) as ViewProps;
    const floatingElement = useSheet ? null : floating.renderFloating(<View {...floatingProps}>{picker}</View>);

    return (
      <Field
        id={fieldId}
        label={label}
        description={description}
        error={error}
        helperText={helperText}
        required={required}
        withAsterisk={withAsterisk}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        style={[getLayoutStyles({ fullWidth }), styles, style]}
        testID={testID}
      >
        {({ controlProps, invalid }) => (
          <>
            <View style={ANCHOR_STYLE}>
              <PickerTrigger
                triggerRef={setTriggerNode}
                triggerProps={{
                  ...controlProps,
                  ...a11yProps({
                    role: 'button',
                    expanded: opened,
                    hasPopup: 'dialog',
                    controls: opened && !useSheet ? panelId : undefined,
                    disabled,
                    value: !isWeb && selected ? { text: selected } : undefined,
                  }),
                  onFocus,
                  onBlur,
                }}
                onPress={() => { if (opened) close(); else open(); }}
                displayValue={selected ?? ''}
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
                endSection={endSection ?? <Icon name="emoji" size={metrics.iconSize} color={theme.text.muted} decorative />}
                startSectionProps={startSectionProps}
                endSectionProps={endSectionProps}
                showClear={clearable && !!selected && !disabled && !readOnly}
                onClear={clear}
                clearButtonLabel={clearButtonLabel}
                testID={testID ? `${testID}-trigger` : undefined}
              />
              {floatingElement}
            </View>
            {renderDisclaimer()}
            {useSheet ? (
              <DropdownSheet
                opened={opened}
                onClose={close}
                title={modalTitle}
                withCloseButton
                maxWidth={380}
                testID={testID ? `${testID}-sheet` : undefined}
              >
                {picker}
              </DropdownSheet>
            ) : null}
          </>
        )}
      </Field>
    );
  },
  { displayName: 'EmojiPickerInput' }
);
