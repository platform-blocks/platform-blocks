import React from 'react';
import { Pressable, View, type PressableStateCallbackType, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { isNative, webStyle } from '../../core/platform';
import type { SizeValue } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, stepDown } from '../../core/theme/tokens';
import { Icon } from '../Icon/Icon';

/** Minimum touch target: 24px on web (WCAG 2.2 target size), 44pt on native. */
const WEB_MIN_TARGET = 24;
const NATIVE_MIN_TARGET = 44;
const NATIVE_HIT_SLOP = (NATIVE_MIN_TARGET - WEB_MIN_TARGET) / 2;

const CLOSE_ICON_STROKE = 1.75;
const CLOSE_ICON_REST_OPACITY = 0.55;

/** react-native-web adds `hovered` to the Pressable state; native omits it. */
type WebPressableState = PressableStateCallbackType & { hovered?: boolean };

const TARGET_STYLE: ViewStyle = {
  minWidth: WEB_MIN_TARGET,
  minHeight: WEB_MIN_TARGET,
  alignItems: 'center',
  justifyContent: 'center',
};

export interface RemoveButtonProps {
  /** Size of the chip/badge the button sits in. */
  size: SizeValue;
  /** Icon color — the host's resolved label color, so it reads on every variant. */
  color: string;
  onPress: () => void;
  disabled?: boolean;
  /** Accessible name, e.g. "Remove React". */
  label: string;
  testID?: string;
}

/**
 * The circular remove ("×") control inside a Chip or Badge.
 *
 * Drawn deliberately light — a hairline stroke at partial opacity — so the host
 * reads as its label first; hover/press bring it to full strength over the
 * theme's hover/pressed wash. The touch target is at least 24px on web and
 * 44pt on native (hitSlop), whatever the visual size.
 */
export function RemoveButton({ size, color, onPress, disabled, label, testID }: RemoveButtonProps) {
  const theme = useTheme();
  // Track just above the label rather than a fixed floor, which made the ×
  // larger than the text it sat next to on small chips.
  const iconSize = Math.max(12, Math.round(getControlSize(theme, stepDown(size)).fontSize * 1.15));
  const circle = iconSize + 6;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={isNative ? NATIVE_HIT_SLOP : undefined}
      testID={testID}
      style={[TARGET_STYLE, webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' })]}
      {...a11yProps({ role: 'button', label, disabled })}
    >
      {/*
        Function children give the icon the same interaction state the wash uses.
        `hovered` is web-only (undefined on native), so rest → press still works everywhere.
      */}
      {({ hovered, pressed }: WebPressableState) => (
        <View
          style={[
            {
              width: circle,
              height: circle,
              borderRadius: circle / 2,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
              backgroundColor: pressed
                ? theme.backgrounds.pressed
                : hovered
                  ? theme.backgrounds.hover
                  : 'transparent',
            },
            webStyle({ transitionProperty: 'background-color', transitionDuration: '120ms' }),
          ]}
        >
          <Icon
            name="close"
            size={iconSize}
            stroke={CLOSE_ICON_STROKE}
            color={color}
            style={[
              { opacity: hovered || pressed ? 1 : CLOSE_ICON_REST_OPACITY },
              webStyle({ transitionProperty: 'opacity', transitionDuration: '120ms' }),
            ]}
          />
        </View>
      )}
    </Pressable>
  );
}
