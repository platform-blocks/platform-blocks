import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { Gradient } from '../Gradient';

describe('Gradient', () => {
  it('passes color stops through while retaining Block sizing and content', () => {
    const colors = ['#123456', '#abcdef'];
    render(<Gradient testID="gradient" colors={colors} locations={[0, 1]} w={200}><Text>On gradient</Text></Gradient>);
    const root = screen.getByTestId('gradient');
    const style = StyleSheet.flatten(root.props.style);
    expect(style.backgroundColor).toBe(colors[0]);
    expect(style.width).toBe(200);
    expect(screen.getByText('On gradient')).toBeTruthy();
  });
});
