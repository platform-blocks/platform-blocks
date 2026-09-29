import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

import { useAdjustable } from '../../core/accessibility/useAdjustable';
import { getGestureSurfaceStyle } from '../../core/gestures';
import { isNative } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';

export interface MediaSliderProps {
  /** Current value, 0–1. */
  value: number;
  /** Called with each new value while dragging or on a keyboard / screen-reader step. */
  onChange: (value: number) => void;
  /** Called when a drag starts. */
  onChangeStart?: () => void;
  /** Called with the final value when a drag ends, and after each discrete step. */
  onChangeEnd?: (value: number) => void;
  /** Accessible name ("Seek", "Volume"). */
  label: string;
  /** Spoken value ("1:05 of 4:30"). */
  valueText?: string;
  /** Keyboard / adjust-action step, 0–1. @default 0.05 */
  step?: number;
  /** PageUp / PageDown step, 0–1. @default 0.1 */
  largeStep?: number;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Touch area height: ≥44pt on native, 24px on web. */
const HIT_HEIGHT = isNative ? 44 : 24;
const TRACK_HEIGHT = 4;
const THUMB_SIZE = 12;

const styles = StyleSheet.create({
  root: { height: HIT_HEIGHT, justifyContent: 'center' },
  track: { borderRadius: TRACK_HEIGHT / 2, height: TRACK_HEIGHT, overflow: 'visible' },
  fill: { borderRadius: TRACK_HEIGHT / 2, height: TRACK_HEIGHT, position: 'absolute', start: 0, top: 0 },
  thumb: {
    borderRadius: THUMB_SIZE / 2,
    height: THUMB_SIZE,
    marginStart: -THUMB_SIZE / 2,
    position: 'absolute',
    top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
  },
});

/**
 * The media chrome's own horizontal slider (seek bar, volume): a
 * `useAdjustable` thumb (role slider, `aria-value*`, arrows / PageUp / PageDown
 * / Home / End on web, adjust actions on native) plus press-and-drag on the
 * track. Values are 0–1; RTL tracks fill from the right.
 */
export function MediaSlider({
  value,
  onChange,
  onChangeStart,
  onChangeEnd,
  label,
  valueText,
  step = 0.05,
  largeStep = 0.1,
  trackColor,
  fillColor,
  thumbColor,
  disabled = false,
  style,
  testID,
}: MediaSliderProps) {
  const { isRTL } = useDirection();
  const widthRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const latest = useRef(value);
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  const { adjustableProps } = useAdjustable({
    value: Math.round(clamped * 1000) / 10,
    min: 0,
    max: 100,
    step: step * 100,
    largeStep: largeStep * 100,
    onChange: (percent) => onChange(percent / 100),
    onChangeEnd: onChangeEnd ? (percent) => onChangeEnd(percent / 100) : undefined,
    label,
    valueText,
    disabled,
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    widthRef.current = event.nativeEvent.layout.width;
  }, []);

  const valueAt = useCallback(
    (event: GestureResponderEvent) => {
      const width = widthRef.current;
      if (width <= 0) return clamped;
      const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / width));
      // locationX counts from the physical left; an RTL track fills from the right.
      return isRTL ? 1 - ratio : ratio;
    },
    [clamped, isRTL]
  );

  const percent = `${clamped * 100}%` as const;

  return (
    <View
      style={[styles.root, getGestureSurfaceStyle({ axis: 'x', enabled: !disabled, cursor: 'pointer' }), style]}
      onLayout={handleLayout}
      testID={testID}
      // One accessibility element for the whole slider on native.
      accessible
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event) => {
        setDragging(true);
        onChangeStart?.();
        latest.current = valueAt(event);
        onChange(latest.current);
      }}
      onResponderMove={(event) => {
        latest.current = valueAt(event);
        onChange(latest.current);
      }}
      onResponderRelease={() => {
        setDragging(false);
        onChangeEnd?.(latest.current);
      }}
      onResponderTerminate={() => {
        setDragging(false);
        onChangeEnd?.(latest.current);
      }}
      {...adjustableProps}
    >
      {/* Children ignore touches so `locationX` is always measured against the root. */}
      <View style={[styles.track, { backgroundColor: trackColor }]} pointerEvents="none">
        <View style={[styles.fill, { backgroundColor: fillColor, width: percent }]} />
        <View
          style={[
            styles.thumb,
            { backgroundColor: thumbColor, start: percent },
            dragging && { transform: [{ scale: 1.25 }] },
          ]}
        />
      </View>
    </View>
  );
}
