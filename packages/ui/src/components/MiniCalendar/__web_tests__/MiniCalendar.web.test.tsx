import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { MiniCalendar } from '../MiniCalendar';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);
const focused = () => document.activeElement as HTMLElement;
const press = (key: string) =>
  act(() => {
    fireEvent.keyDown(focused(), { key });
  });

// Centered on Thursday March 12, 2026: the strip shows March 9 – 15.
const VALUE = new Date(2026, 2, 12);

describe('MiniCalendar (react-native-web DOM)', () => {
  it('renders a one-row grid of full-date day cells with selected / disabled state', () => {
    render(<MiniCalendar value={VALUE} minDate={new Date(2026, 2, 10)} />);

    const grid = screen.getByRole('grid');
    expect(within(grid).getAllByRole('row')).toHaveLength(1);
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(7);
    expect(screen.getByRole('gridcell', { name: 'Thursday, March 12, 2026' }).getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(screen.getByRole('gridcell', { name: 'Monday, March 9, 2026' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('labels the paging controls', () => {
    render(<MiniCalendar value={VALUE} numberOfDays={5} nextControlProps={{ testID: 'next' }} />);

    expect(screen.getByRole('button', { name: 'Previous 5 days' })).toBeTruthy();
    const next = screen.getByRole('button', { name: 'Next 5 days' });
    expect(next.getAttribute('data-testid')).toBe('next');

    act(() => {
      fireEvent.click(next);
    });
    expect(screen.getByRole('gridcell', { name: 'Sunday, March 15, 2026' })).toBeTruthy();
  });

  it('roves with the arrow keys and pages at the ends', () => {
    const onChange = jest.fn();
    render(<MiniCalendar value={VALUE} onChange={onChange} />);

    const selected = screen.getByRole('gridcell', { name: 'Thursday, March 12, 2026' });
    expect(selected.getAttribute('tabindex')).toBe('0');
    act(() => {
      selected.focus();
    });

    press('End');
    expect(focused().getAttribute('aria-label')).toBe('Sunday, March 15, 2026');
    press('ArrowRight');
    expect(focused().getAttribute('aria-label')).toBe('Monday, March 16, 2026');

    press(' ');
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 16));
  });
});
