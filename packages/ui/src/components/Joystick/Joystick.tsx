import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, type AccessibilityActionEvent, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { consumeEvent, readKey, type KeyboardEventLike } from '../../core/accessibility/keyboard';
import { useFieldA11y } from '../../core/accessibility/useFieldA11y';
import { factory } from '../../core/factory';
import { useDragGesture } from '../../core/gestures/useDragGesture';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { webProps } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveComponentSize } from '../../core/theme/componentSize';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { resolveShadow } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { warnOnce } from '../../core/utils/logger';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Text } from '../Text';
import type { JoystickProps, JoystickValue, JoystickVariant } from './types';
import { clampUnit, resolveJoystickValue, valuesEqual, valueToOffset } from './utils';

/** Pad diameters. A joystick is a large surface, not a control-height box, so it keeps its own ladder. */
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

/**
 * The spring the handle has always used — RN `Animated.spring({ speed: 20,
 * bounciness })` — in reanimated's stiffness/damping terms: a small overshoot
 * when springing back to centre, none when an XY pad settles.
 */
const SPRING_BACK = { stiffness: 512, damping: 30, mass: 1 };
const SPRING_SETTLE = { stiffness: 512, damping: 45, mass: 1 };

const defaultValueLabel = (value: JoystickValue) => `x ${value.x.toFixed(2)}  y ${value.y.toFixed(2)}`;

interface VariantVisuals {
  base: ViewStyle;
  handle: ViewStyle;
  guideOpacity: number;
}

const getVariantVisuals = (
  variant: JoystickVariant,
  theme: PlatformBlocksTheme,
  baseColor: string,
  handleColor: string
): VariantVisuals => {
  switch (variant) {
    case 'filled':
      return {
        base: { backgroundColor: baseColor, borderWidth: 0 },
        handle: { backgroundColor: handleColor, borderWidth: 0, ...resolveShadow(theme, 'md') },
        guideOpacity: 0.35,
      };
    case 'outline':
      return {
        base: { backgroundColor: 'transparent', borderWidth: 2, borderColor: baseColor },
        handle: {
          backgroundColor: theme.backgrounds.surface,
          borderWidth: 2,
          borderColor: handleColor,
          ...resolveShadow(theme, 'none'),
        },
        guideOpacity: 0.45,
      };
    case 'minimal':
      return {
        base: { backgroundColor: 'transparent', borderWidth: 0 },
        handle: { backgroundColor: handleColor, borderWidth: 0, ...resolveShadow(theme, 'none') },
        guideOpacity: 0.5,
      };
    case 'unstyled':
      return {
        base: { backgroundColor: 'transparent', borderWidth: 0 },
        handle: { backgroundColor: 'transparent', borderWidth: 0, ...resolveShadow(theme, 'none') },
        guideOpacity: 0,
      };
    case 'default':
    default:
      return {
        base: { backgroundColor: baseColor, borderWidth: 1, borderColor: theme.backgrounds.border },
        handle: {
          backgroundColor: handleColor,
          borderWidth: 2,
          // The ring around the handle matches the surface it sits on.
          borderColor: theme.backgrounds.surface,
          ...resolveShadow(theme, 'sm'),
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
 * keeps tracking the finger instead of handing the touch back to the page; the
 * handle rides reanimated shared values, so a drag never waits on a React
 * commit and the spring back to centre runs on the UI thread (skipped under
 * reduced motion). For assistive technology the pad is an adjustable control
 * named by its label, whose value text reads both axes; increment / decrement
 * move it along x, and on the web arrow keys move it on both axes (Home /
 * Escape recentre).
 */
export const Joystick = factory<{ props: JoystickProps; ref: View }>((props, ref) => {
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
  } = props;

  const theme = useTheme();
  const spacingStyles = useStyleProps(props);

  const [currentValue, setCurrentValue] = useControllableState<JoystickValue>({
    value,
    defaultValue,
    finalValue: CENTER,
    onChange,
  });

  const inputLocked = disabled || readOnly;
  const springsBack = returnToCenter ?? shape === 'circle';
  const emitStart = useLatestCallback(onChangeStart);
  const emitEnd = useLatestCallback(onChangeEnd);

  const resolvedSize = resolveComponentSize(size, SIZE_SCALE, { fallback: 'md' });
  const padSize = typeof resolvedSize === 'number' ? resolvedSize : SIZE_SCALE.md;
  const handleSize = Math.max(16, Math.round(handleSizeProp ?? padSize * 0.32));
  // The handle stays fully inside the pad, so its centre can only reach half the
  // remaining space. Everything downstream is expressed in these units.
  const travel = Math.max(1, (padSize - handleSize) / 2);

  // 0 under reduced motion (or `transitionDuration={0}`): the handle jumps.
  const duration = useTransitionDuration(transitionDuration, 220);

  const accentColor = handleColorProp ?? resolveAccentColor(theme, color) ?? theme.colors.primary[5];
  const surfaceColor = baseColorProp ?? theme.backgrounds.subtle;

  const visuals = useMemo(
    () => getVariantVisuals(variant, theme, surfaceColor, disabled ? theme.text.disabled : accentColor),
    [variant, theme, surfaceColor, accentColor, disabled]
  );

  // Handle position in normalized screen units (Y down).
  const initialOffset = valueToOffset(currentValue, invertY);
  const offsetX = useSharedValue(initialOffset.x);
  const offsetY = useSharedValue(initialOffset.y);
  // Press state only drives the handle's scale, so it lives on the UI thread too.
  const pressed = useSharedValue(0);
  const draggingRef = useRef(false);
  const valueRef = useRef(currentValue);
  valueRef.current = currentValue;

  const commit = useCallback(
    (next: JoystickValue) => {
      if (valuesEqual(next, valueRef.current)) return;
      valueRef.current = next;
      setCurrentValue(next);
    },
    [setCurrentValue]
  );

  const pointToValue = useCallback(
    (x: number, y: number, width: number, height: number) => {
      // Fall back to the configured size until the first layout lands, so a
      // press that arrives before onLayout still maps to a sane position.
      const boxWidth = width || padSize;
      const boxHeight = height || padSize;
      const radiusX = Math.max(1, (boxWidth - handleSize) / 2);
      const radiusY = Math.max(1, (boxHeight - handleSize) / 2);
      return resolveJoystickValue((x - boxWidth / 2) / radiusX, (y - boxHeight / 2) / radiusY, {
        shape,
        deadZone,
        step,
        lockAxis,
        invertY,
      });
    },
    [padSize, handleSize, shape, deadZone, step, lockAxis, invertY]
  );

  const applyPoint = useCallback(
    (point: { x: number; y: number; width: number; height: number }) => {
      const next = pointToValue(point.x, point.y, point.width, point.height);
      const screen = valueToOffset(next, invertY);
      offsetX.value = screen.x;
      offsetY.value = screen.y;
      commit(next);
      return next;
    },
    [pointToValue, invertY, offsetX, offsetY, commit]
  );

  const drag = useDragGesture({
    enabled: !inputLocked,
    // Always `both` (touch-action: none on web), even under `lockAxis`, which
    // constrains the *value* rather than the directions the pad consumes.
    // Leaving the perpendicular direction to the page let a browser start a
    // scroll under a diagonal touch drag; the gesture then refused to be
    // terminated, so the pad kept tracking the finger while the page scrolled.
    axis: 'both',
    cursor: inputLocked ? 'default' : 'grab',
    activeCursor: 'grabbing',
    onStart: (point) => {
      draggingRef.current = true;
      pressed.value = 1;
      // A spring back to centre may still be in flight from the previous gesture.
      cancelAnimation(offsetX);
      cancelAnimation(offsetY);
      emitStart(applyPoint(point));
    },
    onMove: (point) => {
      applyPoint(point);
    },
    onEnd: (point) => {
      draggingRef.current = false;
      pressed.value = 0;
      const settled = springsBack ? CENTER : applyPoint(point);
      if (springsBack) commit(CENTER);
      emitEnd(settled);
    },
    onCancel: () => {
      draggingRef.current = false;
      pressed.value = 0;
      if (springsBack) commit(CENTER);
      emitEnd(springsBack ? CENTER : valueRef.current);
    },
  });

  // Animate the handle for every change the drag did not already paint: the
  // spring back to centre, keyboard nudges, and controlled updates. Depends on
  // the two components rather than the object, so a controlled parent that
  // rebuilds `{ x, y }` each render does not restart the spring.
  const { x: valueX, y: valueY } = currentValue;
  useEffect(() => {
    if (draggingRef.current) return;
    const target = valueToOffset({ x: valueX, y: valueY }, invertY);
    if (duration <= 0) {
      cancelAnimation(offsetX);
      cancelAnimation(offsetY);
      offsetX.value = target.x;
      offsetY.value = target.y;
      return;
    }
    const spring = springsBack ? SPRING_BACK : SPRING_SETTLE;
    offsetX.value = withSpring(target.x, spring);
    offsetY.value = withSpring(target.y, spring);
  }, [valueX, valueY, invertY, duration, springsBack, offsetX, offsetY]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
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
      emitStart(previous);
      commit(next);
      emitEnd(next);
    },
    [inputLocked, keyboardStep, step, invertY, shape, lockAxis, commit, emitStart, emitEnd]
  );

  const recenter = useCallback(() => {
    if (inputLocked) return;
    commit(CENTER);
    emitEnd(CENTER);
  }, [inputLocked, commit, emitEnd]);

  // Arrows move the handle in the direction pressed (a physical 2-D pad, so they
  // don't swap under RTL); Home / Escape recentre.
  const handleKeyDown = useCallback(
    (event: KeyboardEventLike) => {
      if (inputLocked) return;
      const { key } = readKey(event);
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, 1],
        ArrowDown: [0, -1],
      };
      if (moves[key]) {
        consumeEvent(event);
        nudge(moves[key][0], moves[key][1]);
      } else if (key === 'Home' || key === 'Escape') {
        consumeEvent(event);
        recenter();
      }
    },
    [inputLocked, nudge, recenter]
  );

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'increment') nudge(1, 0);
      else if (event.nativeEvent.actionName === 'decrement') nudge(-1, 0);
    },
    [nudge]
  );

  const labelText = defaultValueLabel(currentValue);
  const field = useFieldA11y({ label, accessibilityLabel, disabled, readOnly });
  if (!label && !accessibilityLabel) {
    warnOnce('Joystick.accessibilityLabel', '[Joystick] Pass `label` or `accessibilityLabel` so the pad has an accessible name.');
  }

  const handleAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: offsetX.value * travel },
        { translateY: offsetY.value * travel },
        { scale: 1 + 0.08 * pressed.value },
      ],
    }),
    [travel]
  );
  const crosshairYStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offsetY.value * travel }] }), [travel]);
  const crosshairXStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offsetX.value * travel }] }), [travel]);

  const styles = useThemedStyles(
    (t) => {
      const center = padSize / 2 - 0.5;
      const guide = { position: 'absolute', backgroundColor: t.text.muted, pointerEvents: 'none' } as const;
      return {
        root: { alignItems: 'flex-start' } as ViewStyle,
        label: { marginBottom: 8 } as ViewStyle,
        pad: {
          width: padSize,
          height: padSize,
          borderRadius: shape === 'circle' ? padSize / 2 : Math.round(padSize * 0.12),
          opacity: disabled ? 0.5 : 1,
          overflow: 'hidden',
        } as ViewStyle,
        guideH: { ...guide, start: 0, end: 0, top: center, height: 1 } as ViewStyle,
        guideV: { ...guide, top: 0, bottom: 0, start: center, width: 1 } as ViewStyle,
        crosshairH: { position: 'absolute', start: 0, end: 0, top: center, height: 1, opacity: 0.45, pointerEvents: 'none' } as ViewStyle,
        crosshairV: { position: 'absolute', top: 0, bottom: 0, start: center, width: 1, opacity: 0.45, pointerEvents: 'none' } as ViewStyle,
        handle: {
          position: 'absolute',
          start: (padSize - handleSize) / 2,
          top: (padSize - handleSize) / 2,
          width: handleSize,
          height: handleSize,
          borderRadius: handleSize / 2,
          pointerEvents: 'none',
        } as ViewStyle,
        readout: { marginTop: 8 },
      };
    },
    [padSize, handleSize, shape, disabled]
  );

  const readout = valueLabel ? (typeof valueLabel === 'function' ? valueLabel(currentValue) : labelText) : null;

  return (
    <View ref={ref} testID={testID} style={[styles.root, spacingStyles, style]}>
      {label ? (
        typeof label === 'string' ? (
          <Text id={field.ids.label} size="sm" fw="medium" style={styles.label}>
            {label}
          </Text>
        ) : (
          <View nativeID={field.ids.label} style={styles.label}>
            {label}
          </View>
        )
      ) : null}

      <View
        ref={drag.ref}
        onLayout={drag.onLayout}
        accessible
        {...field.controlProps}
        {...a11yProps({
          role: 'slider',
          disabled,
          readOnly,
          // Increment / decrement act on x; the text reads both axes.
          value: { min: -1, max: 1, now: currentValue.x, text: labelText },
          actions: inputLocked
            ? undefined
            : [
                { name: 'increment', label: 'Move right' },
                { name: 'decrement', label: 'Move left' },
              ],
          onAction: inputLocked ? undefined : handleAccessibilityAction,
        })}
        {...webProps({ tabIndex: disabled ? -1 : 0, onKeyDown: inputLocked ? undefined : handleKeyDown })}
        style={[styles.pad, visuals.base, drag.surfaceStyle, baseStyle]}
        {...drag.panHandlers}
      >
        {showGuides && variant !== 'unstyled' ? (
          <>
            <View style={[styles.guideH, { opacity: visuals.guideOpacity }]} />
            <View style={[styles.guideV, { opacity: visuals.guideOpacity }]} />
          </>
        ) : null}

        {showCrosshair && variant !== 'unstyled' ? (
          // Full-width/height rules that track the handle on one axis each — the
          // XY-pad readout — on the same shared values as the handle.
          <>
            <Animated.View style={[styles.crosshairH, { backgroundColor: accentColor }, crosshairYStyle]} />
            <Animated.View style={[styles.crosshairV, { backgroundColor: accentColor }, crosshairXStyle]} />
          </>
        ) : null}

        <Animated.View style={[styles.handle, visuals.handle, handleStyle, handleAnimatedStyle]} />
      </View>

      {readout ? (
        <Text size="xs" c="dimmed" style={[styles.readout, valueLabelStyle]}>
          {readout}
        </Text>
      ) : null}
    </View>
  );
}, { displayName: 'Joystick' });

Joystick.displayName = 'Joystick';
