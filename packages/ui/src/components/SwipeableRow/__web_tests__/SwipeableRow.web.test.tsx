import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { SwipeableRow } from '../SwipeableRow';

describe('SwipeableRow web', () => {
  it('exposes swipe actions through a labelled action button', () => {
    const archive = jest.fn();
    render(<PlocksProvider><SwipeableRow accessibilityLabel="Message" startActions={[{ key: 'archive', label: 'Archive', onPress: archive }]}><span>Message body</span></SwipeableRow></PlocksProvider>);
    expect(screen.getByText('Message body')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show row actions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(archive).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Show row actions' })).toBeTruthy();
  });

  it('disables its action controls', () => {
    render(<PlocksProvider><SwipeableRow disabled endActions={[{ key: 'delete', label: 'Delete', onPress: jest.fn() }]}><span>Row</span></SwipeableRow></PlocksProvider>);
    expect(screen.getByRole('button', { name: 'Show row actions' }).hasAttribute('disabled')).toBe(true);
  });
});
