import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { ScrollArea } from '../ScrollArea';

describe('ScrollArea', () => {
  it('applies named content spacing and forwards scroll behavior', () => {
    render(<ScrollArea testID="scroll" contentProps={{ p: 'lg', gap: 'sm' }} scrollEnabled={false}><Text>Item</Text></ScrollArea>);
    const scroll = screen.UNSAFE_getByType(ScrollView);
    const content = StyleSheet.flatten(scroll.props.contentContainerStyle);
    expect(content.paddingTop).toBeGreaterThan(0);
    expect(content.gap).toBeGreaterThan(0);
    expect(scroll.props.scrollEnabled).toBe(false);
    expect(screen.getByText('Item')).toBeTruthy();
  });
});
