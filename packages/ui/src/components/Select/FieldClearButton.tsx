import React, { useState } from 'react';
import { Pressable } from 'react-native';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { isWeb, webProps, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { Icon } from '../Icon';

export interface FieldClearButtonProps {
  onPress: () => void;
  /** Accessible name, e.g. "Clear selection". */
  label: string;
  size?: SizeValue;
  disabled?: boolean;
  /** Keep focus where it is when pressed with a pointer (web). */
  preventFocusSteal?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Web target: 24px (WCAG 2.2 target size). Native: 24pt plus hitSlop to 44pt. */
const MIN_TARGET = 24;
const NATIVE_HIT_SLOP = (44 - MIN_TARGET) / 2;

const preventDefault = (event: { preventDefault(): void }) => event.preventDefault();

/**
 * Internal: the clear ("×") button of the group's fields — a labelled button
 * with a real 24px target on web (not just hitSlop) and a 44pt touch area on
 * native. Rendered as a sibling of the field's trigger, never inside it, so no
 * interactive element nests in another.
 */
export function FieldClearButton({
  onPress,
  label,
  size = 'md',
  disabled = false,
  preventFocusSteal = false,
  testID,
  style,
}: FieldClearButtonProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const { iconSize } = getControlSize(theme, size);
  const glyphSize = Math.max(12, Math.round(iconSize * 0.875));

  const handlePress = (event: GestureResponderEvent) => {
    event?.stopPropagation?.();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      {...a11yProps({ role: 'button', label, disabled })}
      hitSlop={isWeb ? undefined : NATIVE_HIT_SLOP}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      testID={testID}
      {...webProps({ onMouseDown: preventFocusSteal ? preventDefault : undefined })}
      style={({ pressed }) => [
        {
          minWidth: MIN_TARGET,
          minHeight: MIN_TARGET,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: MIN_TARGET / 2,
        },
        pressed ? { backgroundColor: theme.backgrounds.pressed } : hovered ? { backgroundColor: theme.backgrounds.hover } : null,
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
        style,
      ]}
    >
      <Icon name="close" size={glyphSize} color={theme.text.muted} decorative />
    </Pressable>
  );
}
