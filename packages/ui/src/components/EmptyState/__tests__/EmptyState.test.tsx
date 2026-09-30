import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';
it('renders shorthand and compound content', () => {
  const view = render(<EmptyState title="No results" description="Try again"><EmptyState.Actions><EmptyState.Title order={2}>More</EmptyState.Title></EmptyState.Actions></EmptyState>);
  expect(view.getByText('No results')).toBeTruthy();
  expect(view.getByText('Try again')).toBeTruthy();
  expect(view.getByText('More')).toBeTruthy();
});
