import React from 'react';
import { Demo } from '../demos/basic';
import { render } from '@testing-library/react';
import { PlocksProvider } from '../../../../../ui/src/core/theme/PlocksProvider';
import { ChartThemeProvider } from '../../../theme/ChartThemeContext';

test('renders its network title and SVG surface on web', () => {
  const { container } = render(<PlocksProvider><ChartThemeProvider><Demo /></ChartThemeProvider></PlocksProvider>);
  expect(container.textContent).toContain('Cross-team collaboration');
  expect(container.querySelector('svg')).not.toBeNull();
});
