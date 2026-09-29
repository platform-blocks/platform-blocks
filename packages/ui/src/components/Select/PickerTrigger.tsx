import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type {
  GestureResponderEvent,
  NativeSyntheticEvent,
  PressableProps,
  StyleProp,
  TargetedEvent,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { isWeb, webStyle } from '../../core/platform';
import type { SizeValue } from '../../core/theme/types';
import type { RadiusValue } from '../../core/types/base';
import type { FieldVariant } from '../_internal/Field/fieldProps';
import { FieldClearButton } from './FieldClearButton';
import { useFieldControlStyles } from './fieldControlStyles';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';

/** Marks the trigger as a library field control, so the global outline yields to the frame's ring. */
const PB_INPUT_DATASET = { pbInput: 'true' } as const;

/** Props for the pressable trigger: ARIA, web key handling, focus callbacks. */
export type PickerTriggerElementProps = Omit<PressableProps, 'style' | 'children' | 'onPress' | 'disabled'>;

export interface PickerTriggerProps {
  /** Ref of the pressable trigger — the focus target and the floating anchor. */
  triggerRef?: React.Ref<View>;
  /** Spread on the trigger (role, aria-*, id, onKeyDown, …). */
  triggerProps?: PickerTriggerElementProps;
  onPress: (event: GestureResponderEvent) => void;
  /** Text shown in the box. Empty / undefined shows the placeholder. */
  displayValue?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  size?: SizeValue;
  radius?: RadiusValue;
  variant?: FieldVariant;
  /** Dropdown open: the frame border takes the accent color. */
  opened?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  startSection?: React.ReactNode;
  /** Trailing affordance (chevron / calendar). Decorative: hidden from assistive technology. */
  endSection?: React.ReactNode;
  startSectionProps?: Omit<ViewProps, 'children'>;
  endSectionProps?: Omit<ViewProps, 'children'>;
  /** Show the clear button (a sibling of the trigger, never nested in it). */
  showClear?: boolean;
  onClear?: () => void;
  clearButtonLabel?: string;
  testID?: string;
  /** Extra styles for the frame (merged last). */
  frameStyle?: StyleProp<ViewStyle>;
}

/**
 * Internal: the field box of the group's pickers (Select, the date / month /
 * year picker inputs). One pressable trigger drawn as the shared field frame —
 * value or placeholder, optional start section, a decorative trailing icon —
 * with the clear button laid over its end as a sibling, so it stays its own
 * focusable, labelled button.
 */
export function PickerTrigger({
  triggerRef,
  triggerProps,
  onPress,
  displayValue,
  placeholder,
  placeholderTextColor,
  size = 'md',
  radius,
  variant = 'default',
  opened = false,
  invalid = false,
  disabled = false,
  readOnly = false,
  startSection,
  endSection,
  startSectionProps,
  endSectionProps,
  showClear = false,
  onClear,
  clearButtonLabel = 'Clear',
  testID,
  frameStyle,
}: PickerTriggerProps) {
  const [focused, setFocused] = useState(false);
  const styles = useFieldControlStyles({ size, radius, variant, focused: opened || focused, invalid, disabled });
  const { metrics } = styles;

  const userOnFocus = triggerProps?.onFocus;
  const userOnBlur = triggerProps?.onBlur;
  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setFocused(true);
      userOnFocus?.(event);
    },
    [userOnFocus]
  );
  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setFocused(false);
      userOnBlur?.(event);
    },
    [userOnBlur]
  );

  const hasValue = displayValue !== undefined && displayValue !== '';
  // Room at the end of the frame for the clear button laid over it.
  const clearSlot = showClear ? 24 + metrics.gap : 0;
  const endSectionWidth = endSection ? metrics.iconSize + metrics.gap : 0;

  return (
    <View style={WRAPPER}>
      <Pressable
        ref={triggerRef}
        {...triggerProps}
        onPress={onPress}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        dataSet={isWeb ? PB_INPUT_DATASET : undefined}
        testID={testID}
        style={[
          styles.frame,
          { gap: metrics.gap },
          clearSlot ? { paddingEnd: metrics.paddingX + clearSlot } : null,
          webStyle({ cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'pointer', userSelect: 'none' }),
          frameStyle,
        ]}
      >
        {focused && !disabled ? <View style={styles.focusRing} /> : null}
        {startSection ? (
          <View {...startSectionProps} style={[SECTION, startSectionProps?.style]}>
            {startSection}
          </View>
        ) : null}
        <View style={VALUE_SLOT}>
          <Text
            numberOfLines={1}
            style={
              hasValue
                ? styles.text
                : [styles.placeholder, placeholderTextColor ? { color: placeholderTextColor } : null]
            }
          >
            {hasValue ? displayValue : placeholder ?? ''}
          </Text>
        </View>
        {endSection ? (
          <View
            {...endSectionProps}
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[SECTION, endSectionProps?.style]}
          >
            {endSection}
          </View>
        ) : null}
      </Pressable>
      {showClear && onClear ? (
        <View
          style={[CLEAR_SLOT, pointerEventsStyles.boxNone, { end: (variant === 'unstyled' ? 0 : metrics.paddingX) + endSectionWidth }]}
        >
          <FieldClearButton onPress={onClear} label={clearButtonLabel} size={size} disabled={disabled} />
        </View>
      ) : null}
    </View>
  );
}

const WRAPPER: ViewStyle = { position: 'relative', width: '100%' };
const VALUE_SLOT: ViewStyle = { flex: 1, minWidth: 0, justifyContent: 'center' };
const SECTION: ViewStyle = { flexDirection: 'row', alignItems: 'center' };
const CLEAR_SLOT: ViewStyle = { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' };
