import React from 'react';
import { Demo } from '../demos/basic';
import { render } from '@testing-library/react';
import { PlocksProvider } from '../../../../../ui/src/core/theme/PlocksProvider';
import { ChartThemeProvider } from '../../../theme/ChartThemeContext';

test('renders its network title, nodes, and links on web', () => {
  const { container, getByTestId } = render(<PlocksProvider><ChartThemeProvider><Demo /></ChartThemeProvider></PlocksProvider>);
  expect(container.textContent).toContain('Cross-team collaboration');
  expect(container.querySelector('svg')).not.toBeNull();
  expect(getByTestId('network-node-product')).not.toBeNull();
  expect(getByTestId('network-link-0')).not.toBeNull();
});
