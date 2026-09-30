import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { EmptyState } from '../EmptyState';
it('exposes a heading only when order is provided', () => {
  render(<PlocksProvider><EmptyState title="No results"><EmptyState.Title order={2}>More</EmptyState.Title></EmptyState></PlocksProvider>);
  expect(screen.getByText('No results')).toBeTruthy();
  expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
});
