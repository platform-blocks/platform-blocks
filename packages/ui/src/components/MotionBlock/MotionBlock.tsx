import React from 'react';
// Bridge the demos' existing Animated.Value timelines through named Block props.
// eslint-disable-next-line no-restricted-imports -- MotionBlock accepts React Native Animated.Value instances.
import { Animated, type View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { Block } from '../Block';
import type { BlockProps } from '../Block';

type AnimatedNumber = number | Animated.Value;
type AnimatedString = string | Animated.AnimatedInterpolation<string>;

export interface MotionBlockProps extends Omit<BlockProps, 'component' | 'translateY' | 'rotate'> {
  scale?: AnimatedNumber;
  translateX?: AnimatedNumber;
  translateY?: AnimatedNumber;
  motionRotate?: AnimatedString;
  motionOpacity?: AnimatedNumber;
  motionWidth?: AnimatedString;
}

/** Block layout with animated movement, scale, opacity, or width. */
export const MotionBlock = factory<{ props: MotionBlockProps; ref: View }>((props, ref) => {
  const { scale, translateX, translateY, motionRotate, motionOpacity, motionWidth, style, ...blockProps } = props;
  const transform = [
    ...(translateX === undefined ? [] : [{ translateX }]),
    ...(translateY === undefined ? [] : [{ translateY }]),
    ...(motionRotate === undefined ? [] : [{ rotate: motionRotate }]),
    ...(scale === undefined ? [] : [{ scale }]),
  ];
  const motionStyle = {
    ...(transform.length ? { transform } : null),
    ...(motionOpacity === undefined ? null : { opacity: motionOpacity }),
    ...(motionWidth === undefined ? null : { width: motionWidth }),
  } as unknown as ViewStyle;
  return <Block {...blockProps} component={Animated.View} ref={ref}
    gap={blockProps.gap ?? 0} style={[motionStyle, style]} />;
}, { displayName: 'MotionBlock' });
