import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { KeyboardAwareLayout } from '../KeyboardAwareLayout';

describe('KeyboardAwareLayout', () => {
  it('uses a scroll view with room below the last control by default', () => {
    render(<KeyboardAwareLayout extraScrollHeight={40}><Text>Last field</Text></KeyboardAwareLayout>);
    const scroll = screen.UNSAFE_getByType(ScrollView);
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(40);
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(screen.getByText('Last field')).toBeTruthy();
  });

  it('can render without a scroll view', () => {
    render(<KeyboardAwareLayout scrollable={false}><Text>Static field</Text></KeyboardAwareLayout>);
    expect(screen.UNSAFE_queryByType(ScrollView)).toBeNull();
    expect(screen.getByText('Static field')).toBeTruthy();
  });
});
