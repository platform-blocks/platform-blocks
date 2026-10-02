import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Space } from '../Space';

test('reserves the requested horizontal and vertical dimensions on web', () => {
  renderWithPlocks(<Space testID="space" w={24} h={12} />);
  const spacer = screen.getByTestId('space');
  expect(spacer.style.width).toBe('24px');
  expect(spacer.style.height).toBe('12px');
});
