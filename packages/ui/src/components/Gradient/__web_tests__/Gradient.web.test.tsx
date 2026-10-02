import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Gradient } from '../Gradient';

test('renders legible overlay content on a web gradient surface', () => {
  renderWithPlocks(<Gradient colors={['#2563eb', '#7c3aed']} testID="gradient"><span>Gradient label</span></Gradient>);
  const label = screen.getByText('Gradient label');
  expect(screen.getByTestId('gradient').contains(label)).toBe(true);
  expect(label.parentElement?.style.backgroundColor).toBe('rgb(37, 99, 235)');
});
