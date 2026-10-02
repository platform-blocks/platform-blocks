import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { GradientText } from '../GradientText';
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';

describe('GradientText', () => {
  it('keeps text readable when only one color is available', () => {
    render(<GradientText testID="gradient-text" colors={['#b03060']}>Readable title</GradientText>);
    expect(StyleSheet.flatten(screen.getByText('Readable title').props.style).color).toBe(DEFAULT_THEME.text.primary);
    expect(screen.getByTestId('gradient-text')).toBeTruthy();
  });
});
