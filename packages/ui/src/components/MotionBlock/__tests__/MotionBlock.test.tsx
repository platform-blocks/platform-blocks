import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { MotionBlock } from '../MotionBlock';

describe('MotionBlock', () => {
  it('preserves animated values for translation and opacity', () => {
    const translateY = new Animated.Value(20);
    const opacity = new Animated.Value(0.4);
    render(<MotionBlock testID="motion" translateY={translateY} motionOpacity={opacity} />);
    const style = StyleSheet.flatten(screen.getByTestId('motion').props.style);
    expect(style.transform).toEqual([{ translateY: 20 }]);
    expect(style.opacity).toBe(0.4);
  });
});
