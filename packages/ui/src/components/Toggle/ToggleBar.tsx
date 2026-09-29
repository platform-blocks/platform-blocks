import React, { useCallback } from 'react';
import { View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import type { SizeValue } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { BaseProps, ColorProp } from '../../core/types/base';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Chip } from '../Chip/Chip';

export interface ToggleBarOption {
  /** Display label for the option */
  label: string;
  /** Value for the option */
  value: string | number;
  /** Optional leading content */
  startSection?: React.ReactNode;
  /** Optional trailing content */
  endSection?: React.ReactNode;
  /** @deprecated Use `startSection`. */
  startIcon?: React.ReactNode;
  /** @deprecated Use `endSection`. */
  endIcon?: React.ReactNode;
  /** Color for the chip when selected */
  color?: ColorProp;
  /** Override the unselected chip variant */
  chipVariant?: 'filled' | 'outline' | 'light';
  /** Disable this option */
  disabled?: boolean;
}

export interface ToggleBarProps extends BaseProps<ViewStyle> {
  /** Selected values (controlled) */
  value?: (string | number)[];
  /** Initial selected values (uncontrolled) */
  defaultValue?: (string | number)[];
  /** Called with updated values */
  onChange?: (vals: (string | number)[]) => void;
  /** Options to render */
  options: ToggleBarOption[];
  /** Allow multiple selection (checkboxes). If false acts like a radio group. */
  multiple?: boolean;
  /** Require at least one selection */
  required?: boolean;
  /** Overall size passed to chips */
  size?: SizeValue;
  /** Default chip variant when not selected */
  chipVariant?: 'filled' | 'outline' | 'light';
  /** Variant to use when selected (defaults to 'filled') */
  selectedVariant?: 'filled' | 'outline' | 'light';
  /** Gap between chips (px) */
  gap?: number;
  /** Accessible name of the group */
  accessibilityLabel?: string;
}

const EMPTY: (string | number)[] = [];

/**
 * A wrapping row of selectable chips: a checkbox group (`multiple`, the
 * default) or a radio group.
 */
export const ToggleBar = factory<{ props: ToggleBarProps; ref: View }>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    options,
    multiple = true,
    required = false,
    size = 'sm',
    chipVariant = 'outline',
    selectedVariant = 'filled',
    gap = 8,
    style,
    testID,
    accessibilityLabel,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const [value, setValue] = useControllableState<(string | number)[]>({
    value: valueProp,
    defaultValue,
    finalValue: EMPTY,
    onChange,
  });

  const handleToggle = useCallback(
    (val: string | number) => {
      const isSelected = value.includes(val);
      if (multiple) {
        if (isSelected) {
          const next = value.filter((v) => v !== val);
          if (required && next.length === 0) return;
          setValue(next);
        } else {
          setValue([...value, val]);
        }
        return;
      }
      if (isSelected) {
        if (required) return; // keep selected
        setValue([]);
      } else {
        setValue([val]);
      }
    },
    [value, multiple, required, setValue]
  );

  return (
    <View
      ref={ref}
      testID={testID}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', gap }, resolveStyleProps(styleProps, theme), style]}
      {...a11yProps({ role: multiple ? 'group' : 'radiogroup', label: accessibilityLabel })}
    >
      {options.map((opt) => (
        <Chip
          key={opt.value}
          size={size}
          variant={selectedVariant}
          uncheckedVariant={opt.chipVariant || chipVariant}
          color={opt.color || 'primary'}
          startSection={opt.startSection ?? opt.startIcon}
          endSection={opt.endSection ?? opt.endIcon}
          disabled={opt.disabled}
          checked={value.includes(opt.value)}
          onChange={() => handleToggle(opt.value)}
          {...(multiple ? null : { role: 'radio' as const })}
        >
          {opt.label}
        </Chip>
      ))}
    </View>
  );
}, { displayName: 'ToggleBar' });

export default ToggleBar;
