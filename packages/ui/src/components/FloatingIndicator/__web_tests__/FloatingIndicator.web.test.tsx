import React from 'react';
import { render } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { FloatingIndicator } from '../FloatingIndicator';
it('does not render without both elements', () => {
  const view = render(<PlocksProvider><FloatingIndicator parent={null} target={null} /></PlocksProvider>);
  expect(view.queryByTestId('indicator')).toBeNull();
});
