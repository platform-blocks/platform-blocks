import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Chip } from '../Chip';
import { useTheme } from '../../core/theme';
import type { SizeValue } from '../../core/theme/sizes';

export interface ToggleBarOption {
  /** Display label for the option */
  label: string;
  /** Value for the option */
  value: string | number;
  /** Optional left icon */
  startIcon?: React.ReactNode;
  /** Optional right icon */
  endIcon?: React.ReactNode;
  /** Color for the chip when selected */
  color?: string; 
  /** Override default chip variant */
  chipVariant?: 'filled' | 'outline' | 'light';
  /** Disable this option */
  disabled?: boolean;
}

export interface ToggleBarProps {
  /** Selected values */
  value: (string | number)[];
  /** Called with updated values */
  onChange?: (vals: (string | number)[]) => void;
  /** Options to render */
  options: ToggleBarOption[];
  /** Allow multiple selection. If false acts like exclusive */
  multiple?: boolean;
  /** Require at least one selection */
  required?: boolean;
  /** Overall size passed to chips */
  size?: SizeValue;
  /** Default chip variant when not selected */
  chipVariant?: 'filled' | 'outline' | 'light';
  /** Variant to use when selected (defaults to 'filled') */
  selectedVariant?: 'filled' | 'outline' | 'light';
  /** Gap between chips */
  gap?: number;
  /** Row wrapping container style */
  style?: any;
}

export const ToggleBar = React.forwardRef<View, ToggleBarProps>(({
  value,
  onChange,
  options,
  multiple = true,
  required = false,
  size = 'sm',
  chipVariant = 'outline',
  selectedVariant = 'filled',
  gap = 8,
  style,
}, ref) => {
  const theme = useTheme();

  const handleToggle = useCallback((val: string | number) => {
    if (!onChange) return;
    const isSelected = value.includes(val);
    if (multiple) {
      if (isSelected) {
        const next = value.filter(v => v !== val);
        if (required && next.length === 0) return;
        onChange(next);
      } else {
        onChange([...value, val]);
      }
    } else {
      if (isSelected) {
        if (required) return; // keep selected
        onChange([]);
      } else {
        onChange([val]);
      }
    }
  }, [onChange, value, multiple, required]);

  return (
    <View ref={ref} style={[{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -(gap/2) }, style]}>
      {options.map(opt => {
        const selected = value.includes(opt.value);
        const variant = selected ? selectedVariant : (opt.chipVariant || chipVariant);
        return (
          <View key={opt.value} style={{ paddingHorizontal: gap/2, paddingBottom: gap/2 }}>
            <Chip
              size={size}
              variant={variant}
              color={opt.color as any || 'primary'}
              startIcon={opt.startIcon}
              endIcon={opt.endIcon}
              disabled={opt.disabled}
              onPress={() => handleToggle(opt.value)}
            >
              {opt.label}
            </Chip>
          </View>
        );
      })}
    </View>
  );
});

ToggleBar.displayName = 'ToggleBar';

export default ToggleBar;
