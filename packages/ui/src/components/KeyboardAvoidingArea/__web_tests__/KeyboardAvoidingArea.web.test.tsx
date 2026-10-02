import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { KeyboardAvoidingArea } from '../KeyboardAvoidingArea';

test('keeps a focusable editor inside the keyboard avoiding web wrapper', () => {
  renderWithPlocks(<KeyboardAvoidingArea testID="area" behavior="padding"><input aria-label="Message" /></KeyboardAvoidingArea>);
  const editor = screen.getByRole('textbox', { name: 'Message' });
  editor.focus();
  expect(document.activeElement).toBe(editor);
  expect(screen.getByTestId('area').contains(editor)).toBe(true);
});
