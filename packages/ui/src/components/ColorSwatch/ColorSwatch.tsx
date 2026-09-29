import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import type { A11yOptions } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { webProps } from '../../core/platform/webProps';
import type { WebKeyboardEvent } from '../../core/platform/webProps';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor } from '../../core/theme/tokens';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { Icon } from '../Icon';
import type { ColorSwatchProps, ColorSwatchRole } from './types';

const CHECKMARK_LAYER: ViewStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  start: 0,
  end: 0,
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const PRESSED_STYLE: ViewStyle = { opacity: 0.8 };
const DISABLED_STYLE: ViewStyle = { opacity: 0.5 };
const INTERACTIVE_WEB_STYLE = webStyle({ cursor: 'pointer' });
const DISABLED_WEB_STYLE = webStyle({ cursor: 'not-allowed' });

/** The selected state in the form the role expects: a toggle is pressed, a radio checked, an option selected. */
function selectionState(role: ColorSwatchRole, selected: boolean | undefined): Partial<A11yOptions> {
  if (role === 'radio') return { checked: !!selected };
  if (role === 'option') return { selected: !!selected };
  // A plain button only becomes a toggle when a selected state is supplied.
  return selected === undefined ? {} : { pressed: selected };
}

function isSpaceKey(event: WebKeyboardEvent): boolean {
  return event.key === ' ' || event.key === 'Spacebar';
}

/**
 * A square of color: a display chip, or — with `onPress` — a pressable swatch
 * for palettes and color pickers (a button by default, `role="radio"` inside a
 * `radiogroup`, `role="option"` inside a `listbox`).
 *
 * @example
 * <ColorSwatch color="#4ECDC4" selected={value === '#4ECDC4'} onPress={() => setValue('#4ECDC4')} />
 */
export const ColorSwatch = factory<{ props: ColorSwatchProps; ref: View }>((props, ref) => {
  const {
    color,
    size = 32,
    selected,
    disabled = false,
    onPress,
    showBorder = true,
    borderColor,
    borderWidth = 1,
    borderRadius = 4,
    showCheckmark = true,
    checkmarkColor,
    accessibilityLabel,
    accessibilityHint,
    role = 'button',
    onFocus,
    onBlur,
    onKeyDown,
    tabIndex,
    style,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const spacingStyles = resolveStyleProps(styleProps, theme);
  const isSelected = !!selected;

  const finalBorderColor = borderColor ?? (isSelected ? theme.colors.primary[6] : theme.backgrounds.borderStrong);
  const finalBorderWidth = isSelected ? Math.max(borderWidth, 2) : borderWidth;
  const resolvedCheckmarkColor = checkmarkColor ?? onColor(theme, color);

  const swatchStyle = useMemo<ViewStyle>(
    () => ({
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius,
      ...(showBorder ? { borderWidth: finalBorderWidth, borderColor: finalBorderColor } : null),
    }),
    [size, color, borderRadius, showBorder, finalBorderWidth, finalBorderColor]
  );

  const checkmark = isSelected && showCheckmark ? (
    <View style={CHECKMARK_LAYER} {...a11yProps({ hidden: true })}>
      <Icon name="success" size={Math.min(size * 0.5, 16)} color={resolvedCheckmarkColor} variant="filled" decorative />
    </View>
  ) : null;

  if (!onPress) {
    // A display chip: only exposed to assistive technology when it has a name.
    return (
      <View
        ref={ref}
        {...(accessibilityLabel ? a11yProps({ role: 'img', label: accessibilityLabel, accessible: true }) : null)}
        style={[swatchStyle, disabled ? DISABLED_STYLE : null, spacingStyles, style]}
        testID={testID}
      >
        {checkmark}
      </View>
    );
  }

  // Space activates buttons natively; radios / options need it wired up (web).
  const handleKeyDown = (event: WebKeyboardEvent) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || role === 'button' || !isSpaceKey(event)) return;
    event.preventDefault();
    onPress();
  };

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      {...a11yProps({
        role,
        label: accessibilityLabel ?? `Color ${color}`,
        hint: accessibilityHint,
        disabled,
        ...selectionState(role, selected),
      })}
      {...webProps({ tabIndex, onKeyDown: handleKeyDown })}
      style={({ pressed }) => [
        swatchStyle,
        disabled ? DISABLED_STYLE : null,
        disabled ? DISABLED_WEB_STYLE : INTERACTIVE_WEB_STYLE,
        pressed && !disabled ? PRESSED_STYLE : null,
        spacingStyles,
        style,
      ]}
      testID={testID}
    >
      {checkmark}
    </Pressable>
  );
});

ColorSwatch.displayName = 'ColorSwatch';
