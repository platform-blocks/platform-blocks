import React from 'react';
import { Demo } from '../demos/basic';
import { render } from '@testing-library/react';
import { PlocksProvider } from '../../../../../ui/src/core/theme/PlocksProvider';
import { ChartThemeProvider } from '../../../theme/ChartThemeContext';

test('renders its HTML plot with named axes on web', () => {
  const { container } = render(<PlocksProvider><ChartThemeProvider><Demo /></ChartThemeProvider></PlocksProvider>);
  expect(container.textContent).toContain('Spend vs. qualified leads');
  expect(container.textContent).toContain('Spend (USD thousands)');
  expect(container.textContent).toContain('Qualified leads');
});
