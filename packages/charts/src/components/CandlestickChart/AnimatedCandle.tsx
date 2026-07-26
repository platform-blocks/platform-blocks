import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { View } from 'react-native';
import type { ChartDataPoint } from '../../types';
import type { useChartTheme } from '../../theme/ChartThemeContext';

export interface CandleDataPoint extends ChartDataPoint {
  open: number;
  close: number;
  high: number;
  low: number;
  chartX: number;
  chartY: number;
  wickY1: number;
  wickY2: number;
  bodyTop: number;
  bodyHeight: number;
  width: number;
}

export interface AnimatedCandleProps {
  candle: CandleDataPoint;
  colorBull: string;
  colorBear: string;
  wickColor?: string;
  isSelected?: boolean;
  index: number;
  disabled?: boolean;
  theme: ReturnType<typeof useChartTheme>;
  /** Draw duration (ms) for the candle body grow-in animation */
  duration?: number;
}

export const AnimatedCandle: React.FC<AnimatedCandleProps> = React.memo(({
  candle,
  colorBull,
  colorBear,
  wickColor,
  isSelected = false,
  index,
  disabled = false,
  theme,
  duration = 420,
}) => {
  const bodyHeight = useSharedValue(Math.max(1, candle.bodyHeight));
  const bodyTop = useSharedValue(candle.bodyTop);
  const bodyOpacity = useSharedValue(disabled ? 1 : 0);
  const wickHeight = useSharedValue(Math.max(1, candle.wickY2 - candle.wickY1));
  const wickTop = useSharedValue(candle.wickY1);
  const wickOpacity = useSharedValue(disabled ? 1 : 0);
  const selectionScale = useSharedValue(isSelected ? 1.08 : 1);

  useEffect(() => {
    if (disabled) {
      bodyHeight.value = Math.max(1, candle.bodyHeight);
      bodyTop.value = candle.bodyTop;
      bodyOpacity.value = 1;
      wickHeight.value = Math.max(1, candle.wickY2 - candle.wickY1);
      wickTop.value = candle.wickY1;
      wickOpacity.value = 1;
      return;
    }

    const delay = index * 20; // Staggered animation
    bodyOpacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      })
    );
    bodyHeight.value = withDelay(
      delay,
      withTiming(Math.max(1, candle.bodyHeight), {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
    bodyTop.value = withDelay(
      delay,
      withTiming(candle.bodyTop, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    wickOpacity.value = withDelay(
      delay + 80,
      withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.quad),
      })
    );
    wickHeight.value = withDelay(
      delay + 80,
      withTiming(Math.max(1, candle.wickY2 - candle.wickY1), {
        duration: 360,
        easing: Easing.out(Easing.quad),
      })
    );
    wickTop.value = withDelay(
      delay + 80,
      withTiming(candle.wickY1, {
        duration: 360,
        easing: Easing.out(Easing.quad),
      })
    );
  }, [disabled, index, duration, candle.bodyHeight, candle.bodyTop, candle.wickY1, candle.wickY2]);

  useEffect(() => {
    selectionScale.value = withTiming(isSelected ? 1.08 : 1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
  }, [isSelected, selectionScale]);

  // Determine if bullish or bearish
  const isBullish = candle.close >= candle.open;
  const fillColor = isBullish ? colorBull : colorBear;
  const resolvedWickColor = wickColor || fillColor;

  const wickStyle = useAnimatedStyle(() => ({
    opacity: wickOpacity.value,
    top: wickTop.value,
    height: Math.max(1, wickHeight.value),
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [
      { scaleX: selectionScale.value },
    ],
    top: bodyTop.value,
    height: Math.max(1, bodyHeight.value),
  }));

  const selectionHaloOpacity = useSharedValue(isSelected ? 0.25 : 0);

  useEffect(() => {
    selectionHaloOpacity.value = withTiming(isSelected ? 0.25 : 0, {
      duration: 180,
      easing: Easing.out(Easing.ease),
    });
  }, [isSelected, selectionHaloOpacity]);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: selectionHaloOpacity.value,
    transform: [
      { scale: selectionScale.value * 1.2 },
    ],
  }));

  return (
    <View
      style={{
        position: 'absolute',
        left: candle.chartX - candle.width / 2,
        top: 0,
        width: candle.width,
        height: '100%',
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: candle.width / 2 - candle.width,
            top: candle.bodyTop - candle.bodyHeight,
            width: candle.width * 2,
            height: candle.bodyHeight * 2 + (candle.wickY2 - candle.wickY1),
            borderRadius: candle.width,
            backgroundColor: fillColor,
            opacity: 0,
          },
          haloStyle,
        ]}
      />
      {/* Wick */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: candle.width / 2 - 0.75,
            width: 1.5,
            backgroundColor: resolvedWickColor,
          },
          wickStyle,
        ]}
      />
      
      {/* Candle Body */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            width: candle.width,
            backgroundColor: fillColor,
            borderRadius: theme.radius / 2,
            borderWidth: isSelected ? 1 : 0,
            borderColor: isSelected ? theme.colors.background : 'transparent',
          },
          bodyStyle,
        ]}
      />
    </View>
  );
});

AnimatedCandle.displayName = 'AnimatedCandle';