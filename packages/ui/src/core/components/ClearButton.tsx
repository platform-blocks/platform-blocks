import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/Icon';
import { a11yProps } from '../accessibility/a11yProps';
import { isWeb } from '../platform';
import { webStyle } from '../platform/webStyle';
import { useTheme } from '../theme/ThemeProvider';
import { getControlSize } from '../theme/tokens';
import type { SizeValue } from '../theme/types';

export interface ClearButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: SizeValue;
  /** Accessible name (fields pass their `clearButtonLabel`). Default `'Clear'`. */
  accessibilityLabel?: string;
  hasRightSection?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Override the computed icon size (defaults to the small-context size). */
  iconSize?: number;
  /** Stroke width of the "close" glyph (defaults to the Icon default). */
  stroke?: number;
  testID?: string;
}

/** Minimum pointer target on web (WCAG 2.2 target size) and minimum layout box on native. */
const MIN_TARGET = 24;
/** Minimum touch target on native (Apple HIG / Material); reached with hitSlop around the 24px box. */
const MIN_TOUCH_TARGET = 44;
const NATIVE_HIT_SLOP = (MIN_TOUCH_TARGET - MIN_TARGET) / 2;

/**
 * Unified clear button used by input-like components (Input, Select,
 * AutoComplete, ColorInput, ...).
 *
 * The glyph stays small, but the pressable box is at least 24×24 (and 44×44
 * on native through hitSlop, which web ignores); negative margins keep the
 * larger box from changing the field's layout.
 */
export function ClearButton({
  onPress,
  disabled = false,
  size = 'md',
  accessibilityLabel = 'Clear',
  hasRightSection = false,
  style,
  iconSize: iconSizeOverride,
  stroke,
  testID,
}: ClearButtonProps) {
  const theme = useTheme();
  const metrics = getControlSize(theme, size);
  const iconSize = iconSizeOverride ?? Math.max(12, metrics.iconSize - 2);
  const box = Math.max(MIN_TARGET, iconSize + 8);
  // Pull the box back to the glyph's footprint so the field doesn't grow.
  const inset = -(box - iconSize) / 2;

  return (
    <Pressable
      onPress={(event) => {
        event?.stopPropagation?.();
        onPress();
      }}
      disabled={disabled}
      {...a11yProps({ role: 'button', label: accessibilityLabel, disabled })}
      hitSlop={isWeb ? undefined : NATIVE_HIT_SLOP}
      testID={testID}
      style={({ pressed }) => [
        {
          minWidth: box,
          minHeight: box,
          alignItems: 'center',
          justifyContent: 'center',
          margin: inset,
          marginEnd: hasRightSection ? metrics.gap : inset,
          borderRadius: box / 2,
        },
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
        pressed ? { opacity: 0.6 } : null,
        style,
      ]}
    >
      <Icon name="close" size={iconSize} stroke={stroke} color={theme.text.muted} />
    </Pressable>
  );
}
