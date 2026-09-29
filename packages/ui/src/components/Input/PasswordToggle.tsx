import React from 'react';
import { Pressable } from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { Icon } from '../Icon';

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
  size?: SizeValue;
  disabled?: boolean;
  showLabel?: string;
  hideLabel?: string;
}

/**
 * Internal show/hide password button for Input `type="password"` and
 * PasswordInput. At least a 24px target (hitSlop adds more on native); negative
 * margins keep it from growing the field.
 */
export function PasswordToggle({
  visible,
  onToggle,
  size = 'md',
  disabled = false,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
}: PasswordToggleProps) {
  const theme = useTheme();
  const iconSize = Math.round(getControlSize(theme, size).iconSize * 1.2);
  const box = Math.max(24, iconSize + 4);

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      {...a11yProps({ role: 'button', label: visible ? hideLabel : showLabel, disabled })}
      hitSlop={8}
      style={[
        {
          minWidth: box,
          minHeight: box,
          alignItems: 'center',
          justifyContent: 'center',
          margin: -(box - iconSize) / 2,
        },
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
      ]}
    >
      <Icon name={visible ? 'eye' : 'eyeOff'} size={iconSize} color={theme.text.muted} />
    </Pressable>
  );
}
