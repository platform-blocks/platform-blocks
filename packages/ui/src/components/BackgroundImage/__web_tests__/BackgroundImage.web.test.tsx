import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { BackgroundImage } from '../BackgroundImage';

test('keeps the image accessible while overlay content remains readable', () => {
  renderWithPlocks(<BackgroundImage src="https://example.com/photo.png" alt="Landscape" testID="hero"><span>Summer sale</span></BackgroundImage>);
  expect(screen.getAllByRole('img', { name: 'Landscape' }).length).toBeGreaterThan(0);
  expect(screen.getByText('Summer sale')).toBeTruthy();
  expect(screen.getByTestId('hero').contains(screen.getAllByRole('img')[0])).toBe(true);
});
