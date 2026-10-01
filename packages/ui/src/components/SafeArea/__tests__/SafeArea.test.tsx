import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { render, screen } from '@testing-library/react-native';

import { SafeArea } from '../SafeArea';

describe('SafeArea', () => {
  it('uses the safe area view and retains Block background and children', () => {
    render(<SafeArea testID="safe" bg="surface"><Text>Content</Text></SafeArea>);
    expect(screen.UNSAFE_getByType(SafeAreaView)).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('safe').props.style).backgroundColor).toBeTruthy();
  });
});
