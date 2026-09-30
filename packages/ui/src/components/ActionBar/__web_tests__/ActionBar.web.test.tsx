import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { ActionBar } from '../ActionBar';
it('groups actions and closes', () => {
  const onClose = jest.fn();
  render(<PlocksProvider><ActionBar opened onClose={onClose} withinPortal={false}><ActionBar.Divider /><ActionBar.CloseButton /></ActionBar></PlocksProvider>);
  expect(screen.getByRole('group', { name: 'Actions' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
