import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Scroller } from '../Scroller';
it('shows a forced end control', () => {
  render(<PlocksProvider><Scroller showEndControl><span>Content</span></Scroller></PlocksProvider>);
  expect(screen.getByRole('button', { name: 'Scroll end' })).toBeTruthy();
});
