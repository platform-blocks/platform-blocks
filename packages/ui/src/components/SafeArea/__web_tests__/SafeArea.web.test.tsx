import React from 'react';
import { screen } from '@testing-library/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { SafeArea } from '../SafeArea';

test('preserves content and named background on the web safe area', () => {
  renderWithPlocks(<SafeAreaProvider><SafeArea testID="safe" bg="subtle"><span>Protected content</span></SafeArea></SafeAreaProvider>);
  const root = screen.getByTestId('safe');
  expect(root.textContent).toContain('Protected content');
  expect(root.style.backgroundColor).not.toBe('');
});
