import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Path, Circle } from 'react-native-svg';

import type { SparklineChartPoint } from './useSparklineGeometry';
import type { SparklineAnimationEasing } from './types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const resolveEasingPreset = (preset: SparklineAnimationEasing | undefined) => {
  switch (preset) {
    case 'linear':
      return Easing.linear;
    case 'easeInOutCubic':
      return Easing.inOut(Easing.cubic);
    case 'easeOutQuad':
      return Easing.out(Easing.quad);
    case 'easeOutCubic':
    default:
      return Easing.out(Easing.cubic);
  }
};

export interface AnimatedSparklineProps {
  strokePath: string;
  fillPath?: string | null;
  pathLength: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
  showPoints: boolean;
  pointSize: number;
  highlightLast: boolean;
  points: SparklineChartPoint[];
  gradientId?: string;
  dataSignature: string;
  disabled?: boolean;
  visible?: boolean;
  highlightExtremaConfig?: {
    showMin: boolean;
    showMax: boolean;
    color: string;
    radius: number;
    outlineColor: string;
    outlineWidth: number;
  };
  minPoint?: SparklineChartPoint | null;
  maxPoint?: SparklineChartPoint | null;
  animationConfig?: {
    enabled: boolean;
    duration: number;
    delay: number;
    easing: SparklineAnimationEasing;
  };
}

export const AnimatedSparkline: React.FC<AnimatedSparklineProps> = React.memo((props) => {
  const {
    strokePath,
    fillPath,
    pathLength,
    strokeColor,
    strokeWidth,
    fillColor,
    fillOpacity,
    showPoints,
    pointSize,
    highlightLast,
    points,
    gradientId,
    dataSignature,
    disabled = false,
    visible = true,
    highlightExtremaConfig,
    minPoint,
    maxPoint,
    animationConfig,
  } = props;

  const progress = useSharedValue(0);
  const safeLength = Math.max(pathLength, 0.0001);

  useEffect(() => {
    const enabled = animationConfig?.enabled !== false;
    if (disabled || !visible || !enabled) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    const duration = animationConfig?.duration ?? 550;
    const delay = animationConfig?.delay ?? 0;
    const easing = resolveEasingPreset(animationConfig?.easing);
    const timing = withTiming(1, {
      duration,
      easing,
    });
    progress.value = delay > 0 ? withDelay(delay, timing) : timing;
  }, [animationConfig, dataSignature, disabled, progress, visible]);

  const strokeAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: [safeLength, safeLength],
    strokeDashoffset: (1 - progress.value) * safeLength,
    opacity: visible ? Math.min(1, Math.max(progress.value, 0.05)) : 0,
  }));

  // The gradient already carries `fillOpacity` in its stops, so multiplying it in
  // here again squared it — a 0.15 fill rendered at 0.02 and read as no fill at
  // all. Only a flat fill needs the opacity applied at the path.
  const fillAnimatedProps = useAnimatedProps(() => ({
    opacity: visible && fillPath ? progress.value * (gradientId ? 1 : fillOpacity) : 0,
  }));

  const pointAnimatedProps = useAnimatedProps(() => ({
    opacity: visible ? progress.value : 0,
  }));

  const highlightAnimatedProps = useAnimatedProps(() => ({
    opacity: visible && highlightLast ? progress.value : 0,
    r: highlightLast ? pointSize + 1 + progress.value : pointSize + 1,
  }));

  const extremaAnimatedProps = useAnimatedProps(() => ({
    opacity: visible ? progress.value : 0,
  }));

  if (!visible || !points.length || !strokePath) {
    return null;
  }

  const lastPoint = points[points.length - 1];

  return (
    <>
      {fillPath ? (
        <AnimatedPath
          d={fillPath}
          fill={gradientId ? `url(#${gradientId})` : fillColor}
          animatedProps={fillAnimatedProps}
        />
      ) : null}

      <AnimatedPath
        d={strokePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        animatedProps={strokeAnimatedProps}
      />

      {showPoints
        ? points.map((point, index) => (
            <AnimatedCircle
              key={`spark-point-${index}`}
              cx={point.chartX}
              cy={point.chartY}
              r={pointSize}
              fill={strokeColor}
              animatedProps={pointAnimatedProps}
            />
          ))
        : null}

      {highlightExtremaConfig?.showMin && minPoint ? (
        <AnimatedCircle
          cx={minPoint.chartX}
          cy={minPoint.chartY}
          r={highlightExtremaConfig.radius}
          fill={highlightExtremaConfig.color}
          stroke={highlightExtremaConfig.outlineColor}
          strokeWidth={highlightExtremaConfig.outlineWidth}
          animatedProps={extremaAnimatedProps}
        />
      ) : null}

      {highlightExtremaConfig?.showMax && maxPoint ? (
        <AnimatedCircle
          cx={maxPoint.chartX}
          cy={maxPoint.chartY}
          r={highlightExtremaConfig.radius}
          fill={highlightExtremaConfig.color}
          stroke={highlightExtremaConfig.outlineColor}
          strokeWidth={highlightExtremaConfig.outlineWidth}
          animatedProps={extremaAnimatedProps}
        />
      ) : null}

      {highlightLast && lastPoint ? (
        <AnimatedCircle
          cx={lastPoint.chartX}
          cy={lastPoint.chartY}
          fill={strokeColor}
          stroke="white"
          strokeWidth={1}
          animatedProps={highlightAnimatedProps}
        />
      ) : null}
    </>
  );
});

AnimatedSparkline.displayName = 'AnimatedSparkline';
