import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { FloatingWindow } from '../FloatingWindow';
it('makes its resize grip accessible', () => {
  render(<PlocksProvider><FloatingWindow withinPortal={false}><FloatingWindow.ResizeHandle /></FloatingWindow></PlocksProvider>);
  expect(screen.getByRole('separator', { name: 'Resize window' })).toBeTruthy();
});
