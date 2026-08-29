import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { Text } from '../Text';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { resolveComponentSize } from '../../core/theme/componentSize';
import { createFocusStyles } from '../../core/interactive-states';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { useDragGesture } from '../../core/gestures';
import { useControllableState } from '../../hooks/useControllableState';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import type { JoystickProps, JoystickValue, JoystickVariant } from './types';
import { clampUnit, resolveJoystickValue, roundValue, valuesEqual, valueToOffset } from './utils';

const SIZE_SCALE = {
  xs: 88,
  sm: 112,
  md: 144,
  lg: 184,
  xl: 224,
  '2xl': 264,
  '3xl': 320,
} as const;

const CENTER: JoystickValue = { x: 0, y: 0 };

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const defaultValueLabel = (value: JoystickValue) =>
  `x ${value.x.toFixed(2)}  y ${value.y.toFixed(2)}`;

interface VariantVisuals {
  base: ViewStyle;
  handle: ViewStyle;
  guideOpacity: number;
}

const getVariantVisuals = (
  variant: JoystickVariant,
  theme: any,
  baseColor: string,
  handleColor: string
): VariantVisuals => {
  switch (variant) {
    case 'filled':
      return {
        base: { backgroundColor: baseColor, borderWidth: 0 },
        handle: {
          backgroundColor: handleColor,
          borderWidth: 0,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.28)',
          elevation: 5,
        },
        guideOpacity: 0.35,
      };
    case 'outline':
      return {
        base: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: baseColor,
        },
        handle: {
          backgroundColor: theme.backgrounds?.surface ?? '#fff',
          borderWidth: 2,
          borderColor: handleColor,
          elevation: 0,
        },
        guideOpacity: 0.45,
      };
    case 'minimal':
      return {
        base: { backgroundColor: 'transparent', borderWidth: 0 },
        handle: { backgroundColor: handleColor, borderWidth: 0, elevation: 0 },
        guideOpacity: 0.5,
      };
    case 'unstyled':
      return {
        base: { backgroundColor: 'transparent', borderWidth: 0 },
        handle: { backgroundColor: 'transparent', borderWidth: 0, elevation: 0 },
        guideOpacity: 0,
      };
    case 'default':
    default:
      return {
        base: { backgroundColor: baseColor, borderWidth: 1, borderColor: theme.semantic?.borderSubtle ?? theme.colors.gray[3] },
        handle: {
          backgroundColor: handleColor,
          borderWidth: 2,
          borderColor: '#fff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
          elevation: 4,
        },
        guideOpacity: 0.4,
      };
  }
};

/**
 * A two-axis positional input — a stick that springs back to centre, or an XY
 * pad that holds where it is left.
 *
 * The gesture runs on the shared `useDragGesture`, so a drag that leaves the pad
 * keeps tracking the finger instead of handing the touch back to the page.
 */
export const Joystick = factory<{
  props: JoystickProps;
  ref: View;
}>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    onChangeStart,
    shape = 'circle',
    returnToCenter,
    lockAxis,
    deadZone = 0,
    step = 0,
    keyboardStep,
    invertY = true,
    size = 'md',
    handleSize: handleSizeProp,
    variant = 'default',
    color,
    baseColor: baseColorProp,
    handleColor: handleColorProp,
    showGuides = true,
    showCrosshair = false,
    valueLabel = false,
    label,
    disabled = false,
    readOnly = false,
    transitionDuration,
    style,
    baseStyle,
    handleStyle,
    valueLabelStyle,
    accessibilityLabel,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { spacingProps } = extractSpacingProps(rest as any);
  const spacingStyles = getSpacingStyles(spacingProps);

  const [currentValue, setCurrentValue] = useControllableState<JoystickValue>({
    value,
    defaultValue,
    finalValue: CENTER,
    onChange,
  });

  const inputLocked = disabled || readOnly;
  const springsBack = returnToCenter ?? shape === 'circle';
  const [isFocused, setIsFocused] = useState(false);

  const resolvedSize = resolveComponentSize(size, SIZE_SCALE, { fallback: 'md' });
  const padSize = typeof resolvedSize === 'number' ? resolvedSize : SIZE_SCALE.md;
  const handleSize = Math.max(16, Math.round(handleSizeProp ?? padSize * 0.32));
  // The handle stays fully inside the pad, so its centre can only reach half the
  // remaining space. Everything downstream is expressed in these units.
  const travel = Math.max(1, (padSize - handleSize) / 2);

  const duration = useTransitionDuration(transitionDuration, 220);

  const accentColor = handleColorProp
    ?? resolveAccentColor(theme, color)
    ?? theme.colors.primary[5];
  const surfaceColor = baseColorProp
    ?? (theme.colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[2]);

  const visuals = useMemo(
    () => getVariantVisuals(variant, theme, surfaceColor, disabled ? theme.colors.gray[4] : accentColor),
    [variant, theme, surfaceColor, accentColor, disabled]
  );

  // Handle position in normalized screen units (Y down), kept on the animated
  // layer so a drag never waits on a React commit and the spring back to centre
  // runs off the JS thread on native.
  const offset = useRef(new Animated.ValueXY(valueToOffset(currentValue, invertY))).current;
  const draggingRef = useRef(false);
  const valueRef = useRef(currentValue);
  valueRef.current = currentValue;

  const commit = useCallback((next: JoystickValue) => {
    if (valuesEqual(next, valueRef.current)) return;
    setCurrentValue(next);
  }, [setCurrentValue]);

  const pointToValue = useCallback((x: number, y: number, width: number, height: number) => {
    // Fall back to the configured size until the first layout lands, so a press
    // that arrives before onLayout still maps to a sane position.
    const boxWidth = width || padSize;
    const boxHeight = height || padSize;
    const radiusX = Math.max(1, (boxWidth - handleSize) / 2);
    const radiusY = Math.max(1, (boxHeight - handleSize) / 2);
    return resolveJoystickValue(
      (x - boxWidth / 2) / radiusX,
      (y - boxHeight / 2) / radiusY,
      { shape, deadZone, step, lockAxis, invertY }
    );
  }, [padSize, handleSize, shape, deadZone, step, lockAxis, invertY]);

  const applyPoint = useCallback((point: { x: number; y: number; width: number; height: number }) => {
    const next = pointToValue(point.x, point.y, point.width, point.height);
    const screen = valueToOffset(next, invertY);
    offset.setValue(screen);
    commit(next);
    return next;
  }, [pointToValue, invertY, offset, commit]);

  const drag = useDragGesture({
    enabled: !inputLocked,
    // Always `both` (touch-action: none on web), even under `lockAxis`, which
    // constrains the *value* rather than the directions the pad consumes.
    // Leaving the perpendicular direction to the page let a browser start a
    // scroll under a diagonal touch drag; the gesture then refused to be
    // terminated, so the pad kept tracking the finger while the page scrolled
    // underneath it and react-native-web logged "ScrollView doesn't take
    // rejection well" for every rejected hand-over.
    axis: 'both',
    cursor: inputLocked ? 'default' : 'grab',
    activeCursor: 'grabbing',
    onStart: (point) => {
      draggingRef.current = true;
      // A spring back to centre may still be in flight from the previous
      // gesture; left running it would fight the new drag for a frame or two.
      offset.stopAnimation();
      // Applied on its own line: `onChangeStart?.(applyPoint(point))` would skip
      // the whole call expression — argument included — whenever no
      // `onChangeStart` was passed, so the press would land no value at all.
      const next = applyPoint(point);
      onChangeStart?.(next);
    },
    onMove: (point) => {
      applyPoint(point);
    },
    onEnd: (point) => {
      draggingRef.current = false;
      const settled = springsBack ? CENTER : applyPoint(point);
      if (springsBack) commit(CENTER);
      onChangeEnd?.(settled);
    },
    onCancel: () => {
      draggingRef.current = false;
      if (springsBack) commit(CENTER);
      onChangeEnd?.(springsBack ? CENTER : valueRef.current);
    },
  });

  // Animate the handle for every change the drag did not already paint:
  // the spring back to centre, keyboard nudges, and controlled updates.
  // Depends on the two components rather than the object, so a controlled
  // parent that rebuilds `{ x, y }` each render does not restart the spring.
  const { x: valueX, y: valueY } = currentValue;
  useEffect(() => {
    if (draggingRef.current) return;
    const target = valueToOffset({ x: valueX, y: valueY }, invertY);
    if (duration <= 0) {
      offset.setValue(target);
      return;
    }
    const animation = Animated.spring(offset, {
      toValue: target,
      useNativeDriver: USE_NATIVE_DRIVER,
      speed: 20,
      bounciness: springsBack ? 8 : 0,
    });
    animation.start();
    return () => animation.stop();
  }, [valueX, valueY, invertY, duration, offset, springsBack]);

  const nudge = useCallback((dx: number, dy: number) => {
    if (inputLocked) return;
    const amount = keyboardStep ?? (step > 0 ? step : 0.1);
    const previous = valueRef.current;
    const next = resolveJoystickValue(
      clampUnit(previous.x + dx * amount),
      // resolveJoystickValue works in screen space, so an "up" nudge has to be
      // expressed the same way the pointer would express it.
      clampUnit(invertY ? -(previous.y + dy * amount) : previous.y + dy * amount),
      { shape, deadZone: 0, step, lockAxis, invertY }
    );
    onChangeStart?.(previous);
    commit(next);
    onChangeEnd?.(next);
  }, [inputLocked, keyboardStep, step, invertY, shape, lockAxis, commit, onChangeStart, onChangeEnd]);

  const recenter = useCallback(() => {
    if (inputLocked) return;
    commit(CENTER);
    onChangeEnd?.(CENTER);
  }, [inputLocked, commit, onChangeEnd]);

  const handleKeyDown = useCallback((event: any) => {
    if (inputLocked) return;
    switch (event?.key) {
      case 'ArrowLeft': event.preventDefault?.(); nudge(-1, 0); break;
      case 'ArrowRight': event.preventDefault?.(); nudge(1, 0); break;
      case 'ArrowUp': event.preventDefault?.(); nudge(0, 1); break;
      case 'ArrowDown': event.preventDefault?.(); nudge(0, -1); break;
      case 'Home':
      case 'Escape': event.preventDefault?.(); recenter(); break;
      default: break;
    }
  }, [inputLocked, nudge, recenter]);

  const translateX = useMemo(() => Animated.multiply(offset.x, travel), [offset.x, travel]);
  const translateY = useMemo(() => Animated.multiply(offset.y, travel), [offset.y, travel]);

  // Rebuilt as one array so the drag scale composes with the translation
  // instead of a second style object replacing the whole transform.
  const handleTransform = useMemo(
    () => (drag.isDragging
      ? [{ translateX }, { translateY }, { scale: 1.08 }]
      : [{ translateX }, { translateY }]),
    [drag.isDragging, translateX, translateY]
  );

  const borderRadius = shape === 'circle' ? padSize / 2 : Math.round(padSize * 0.12);
  const guideColor = theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[4];

  const labelText = valueLabel
    ? (typeof valueLabel === 'function' ? valueLabel(currentValue) : defaultValueLabel(currentValue))
    : null;

  const keyboardProps = Platform.OS === 'web' && !inputLocked
    ? {
      tabIndex: 0 as const,
      onKeyDown: handleKeyDown,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    }
    : {};

  return (
    <View
      ref={ref}
      testID={testID}
      style={[{ alignItems: 'flex-start' }, spacingStyles, style]}
    >
      {label ? (
        typeof label === 'string'
          ? <Text size="sm" weight="medium" style={{ marginBottom: 8 }}>{label}</Text>
          : <View style={{ marginBottom: 8 }}>{label}</View>
      ) : null}

      <View
        ref={drag.ref}
        onLayout={drag.onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel ?? 'Joystick'}
        accessibilityState={{ disabled }}
        accessibilityValue={{ text: defaultValueLabel(currentValue) }}
        accessibilityActions={inputLocked ? undefined : [
          { name: 'increment', label: 'Move right' },
          { name: 'decrement', label: 'Move left' },
        ]}
        onAccessibilityAction={inputLocked ? undefined : (event) => {
          if (event.nativeEvent.actionName === 'increment') nudge(1, 0);
          if (event.nativeEvent.actionName === 'decrement') nudge(-1, 0);
        }}
        style={[
          {
            width: padSize,
            height: padSize,
            borderRadius,
            opacity: disabled ? 0.5 : 1,
            overflow: 'hidden',
          },
          visuals.base,
          drag.surfaceStyle,
          createFocusStyles(theme, isFocused),
          baseStyle,
        ]}
        {...keyboardProps}
        {...drag.panHandlers}
      >
        {showGuides && variant !== 'unstyled' ? (
          <>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: padSize / 2 - 0.5,
                height: 1,
                backgroundColor: guideColor,
                opacity: visuals.guideOpacity,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: padSize / 2 - 0.5,
                width: 1,
                backgroundColor: guideColor,
                opacity: visuals.guideOpacity,
              }}
            />
          </>
        ) : null}

        {showCrosshair && variant !== 'unstyled' ? (
          // Full-width/height rules that track the handle on one axis each — the
          // XY-pad readout. Both are pure translations, so they ride the same
          // animated values as the handle and stay in sync with it frame for frame.
          <>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: padSize / 2 - 0.5,
                height: 1,
                backgroundColor: accentColor,
                opacity: 0.45,
                transform: [{ translateY }],
              }}
            />
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: padSize / 2 - 0.5,
                width: 1,
                backgroundColor: accentColor,
                opacity: 0.45,
                transform: [{ translateX }],
              }}
            />
          </>
        ) : null}

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: (padSize - handleSize) / 2,
              top: (padSize - handleSize) / 2,
              width: handleSize,
              height: handleSize,
              borderRadius: handleSize / 2,
              transform: handleTransform,
            },
            visuals.handle,
            handleStyle,
          ]}
        />
      </View>

      {labelText ? (
        <Text size="xs" c="dimmed" style={[{ marginTop: 8 }, valueLabelStyle]}>
          {labelText}
        </Text>
      ) : null}
    </View>
  );
});

Joystick.displayName = 'Joystick';
