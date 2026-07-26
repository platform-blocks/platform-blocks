import React, { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import type { KnobAppearance } from '../types';
import { knobStyles as styles } from '../styles';

export type ThumbLayerProps = {
  thumbConfig?: KnobAppearance['thumb'] | null;
  thumbSize: number;
  thumbColor: string;
  disabled: boolean;
  thumbTransformStyle: ViewStyle;
  thumbStyle?: StyleProp<ViewStyle>;
  displayValue: number;
  displayAngle: number;
  /** True while the knob is being dragged, which is when the thumb wears its press size. */
  isScrubbing?: boolean;
};

export const ThumbLayer: React.FC<ThumbLayerProps> = ({
  thumbConfig,
  thumbSize,
  thumbColor,
  disabled,
  thumbTransformStyle,
  thumbStyle,
  displayValue,
  displayAngle,
  isScrubbing = false,
}) => {
  const normalizedThumb = typeof thumbConfig === 'object' && thumbConfig !== null ? thumbConfig : null;
  const thumbShape = normalizedThumb?.shape ?? 'circle';
  const glowConfig = normalizedThumb?.glow;
  const halfThumb = thumbSize / 2;

  const thumbBorderRadius = useMemo(() => {
    switch (thumbShape) {
      case 'square':
        return Math.max(2, thumbSize * 0.15);
      case 'pill':
        return thumbSize / 2;
      default:
        return thumbSize / 2;
    }
  }, [thumbShape, thumbSize]);

  const thumbGlowStyle: ViewStyle | null = useMemo(() => {
    if (!glowConfig) return null;
    return {
      shadowColor: glowConfig.color ?? thumbColor,
      shadowOpacity: glowConfig.intensity ?? 0.35,
      shadowRadius: glowConfig.blur ?? thumbSize * 0.5,
      shadowOffset: { width: 0, height: 0 },
    };
  }, [glowConfig, thumbColor, thumbSize]);

  if (!normalizedThumb) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.thumb,
        {
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbBorderRadius,
          marginLeft: -halfThumb,
          marginTop: -halfThumb,
          backgroundColor: thumbColor,
          borderWidth: normalizedThumb.strokeWidth ?? 0,
          borderColor: normalizedThumb.strokeColor ?? 'transparent',
          shadowOpacity: disabled ? 0 : 0.2,
        },
        normalizedThumb.style,
        thumbGlowStyle ?? undefined,
        thumbStyle,
        thumbTransformStyle,
      ]}
    >
      {normalizedThumb.renderThumb?.({
        value: displayValue,
        angle: displayAngle,
        size: thumbSize,
        isScrubbing,
      })}
    </Animated.View>
  );
};
