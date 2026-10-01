import React from 'react';
import { KeyboardAvoidingView, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { KeyboardAvoidingArea } from '../KeyboardAvoidingArea';

describe('KeyboardAvoidingArea', () => {
  it('forwards keyboard avoidance settings and renders the content', () => {
    render(<KeyboardAvoidingArea testID="area" behavior="padding" keyboardVerticalOffset={48}><Text>Editor</Text></KeyboardAvoidingArea>);
    const avoidingView = screen.UNSAFE_getByType(KeyboardAvoidingView);
    expect(avoidingView.props.behavior).toBe('padding');
    expect(avoidingView.props.keyboardVerticalOffset).toBe(48);
    expect(screen.getByText('Editor')).toBeTruthy();
  });
});
