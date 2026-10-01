import React, { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { isChartTouchInput } from '../../interaction/touchInput';

const AnimatedSvgPath = Animated.createAnimatedComponent(Path);

export interface AnimatedLinkProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  weight: number;
  index: number;
  color: string;
  opacity?: number;
  strokeWidth?: number;
  shape?: 'straight' | 'curved';
  curveStrength?: number;
  parallelIndex?: number;
  parallelCount?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
  onTouchStart?: () => void;
  onTouchRelease?: () => void;
  testID?: string;
}

export const AnimatedLink: React.FC<AnimatedLinkProps> = React.memo(
  ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    weight,
    color,
    opacity = 0.6,
    strokeWidth,
    shape = 'straight',
    curveStrength = 0.35,
    parallelIndex = 0,
    parallelCount = 1,
    onFocus,
    onBlur,
    onPress,
    onTouchStart,
    onTouchRelease,
    testID,
  }) => {
    const x1 = useSharedValue(sourceX);
    const y1 = useSharedValue(sourceY);
    const x2 = useSharedValue(targetX);
    const y2 = useSharedValue(targetY);
    const strokeOpacity = useSharedValue(0);

    const resolvedWidth = strokeWidth ?? Math.max(1, weight * 0.5);
    const resolvedOpacity = opacity ?? 0.6;
    const isCurved = shape === 'curved';
    const totalParallel = Math.max(1, parallelCount);
    const parallelOffset = totalParallel > 1 ? parallelIndex - (totalParallel - 1) / 2 : 0;
    const strength = Math.max(0, curveStrength);

    useEffect(() => {
      // Skip animations for performance - directly set positions
      x1.value = sourceX;
      y1.value = sourceY;
      x2.value = targetX;
      y2.value = targetY;
      strokeOpacity.value = resolvedOpacity;
    }, [sourceX, sourceY, targetX, targetY, resolvedOpacity, x1, y1, x2, y2, strokeOpacity]);

    const animatedProps = useAnimatedProps(() => ({
      d: (() => {
        const sx = x1.value;
        const sy = y1.value;
        const tx = x2.value;
        const ty = y2.value;

        if (!isCurved) {
          return `M ${sx} ${sy} L ${tx} ${ty}`;
        }

        const dx = tx - sx;
        const dy = ty - sy;
        const length = Math.sqrt(dx * dx + dy * dy) || 1;
        const normX = length === 0 ? 0 : -dy / length;
        const normY = length === 0 ? 0 : dx / length;
        const curvature = strength * length * parallelOffset;
        const controlX = (sx + tx) / 2 + normX * curvature;
        const controlY = (sy + ty) / 2 + normY * curvature;
        return `M ${sx} ${sy} Q ${controlX} ${controlY} ${tx} ${ty}`;
      })(),
      strokeOpacity: strokeOpacity.value,
    }));

    const handleFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      onBlur?.();
    }, [onBlur]);

    const handlePress = useCallback(() => {
      onPress?.();
    }, [onPress]);

    return (
      <AnimatedSvgPath
        testID={testID}
        animatedProps={animatedProps}
        stroke={color}
        strokeWidth={resolvedWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        pointerEvents="auto"
        onPress={onPress ? handlePress : undefined}
        // Web hover maps to focus/blur; native touch uses press-in/out. Passing
        // onPressIn/onPressOut on web leaks them to the DOM node (react-native-svg
        // only maps onPress), which React warns about as unknown event handlers.
        {...((Platform.OS === 'web'
          ? {
              onMouseEnter: onFocus ? handleFocus : undefined,
              onMouseLeave: onBlur ? handleBlur : undefined,
              onPointerDown: (event: any) => {
                if (!isChartTouchInput(event)) return;
                onTouchStart?.();
                handleFocus();
              },
              onPointerUp: (event: any) => {
                if (!isChartTouchInput(event)) return;
                handleFocus();
                onTouchRelease?.();
              },
            }
          : {
              onPressIn: () => { onTouchStart?.(); handleFocus(); },
              onPressOut: () => { onTouchRelease?.(); handleBlur(); },
            }) as Record<string, any>)}
      />
    );
  }
);

AnimatedLink.displayName = 'NetworkAnimatedLink';
