import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { YearPicker } from '../YearPicker';

const render = (ui: React.ReactElement, direction: 'ltr' | 'rtl' = 'ltr') =>
  rtlRender(<PlocksProvider direction={{ initialDirection: direction }}>{ui}</PlocksProvider>);
const focused = () => document.activeElement as HTMLElement;
const press = (key: string) =>
  act(() => {
    fireEvent.keyDown(focused(), { key });
  });

describe('YearPicker (react-native-web DOM)', () => {
  it('renders a grid of years with selected / current / disabled state', () => {
    const thisYear = new Date().getFullYear();
    const decade = Math.floor(thisYear / 10) * 10;
    render(<YearPicker decade={decade} value={new Date(decade + 1, 0, 1)} maxDate={new Date(decade + 15, 0, 1)} />);

    const grid = screen.getByRole('grid', { name: `${decade} – ${decade + 19}` });
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(20);
    expect(screen.getByRole('gridcell', { name: String(decade + 1) }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('gridcell', { name: String(thisYear) }).getAttribute('aria-current')).toBe(
      thisYear === decade + 1 ? null : 'date'
    );
    expect(screen.getByRole('gridcell', { name: String(decade + 16) }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Previous decade' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next decade' })).toBeTruthy();
  });

  it('roves focus by year and by row, mirrored in RTL', () => {
    render(<YearPicker decade={2020} value={new Date(2025, 0, 1)} yearsPerRow={4} />, 'rtl');

    act(() => {
      screen.getByRole('gridcell', { name: '2025' }).focus();
    });
    press('ArrowLeft');
    expect(focused().getAttribute('aria-label')).toBe('2026');
    press('ArrowDown');
    expect(focused().getAttribute('aria-label')).toBe('2030');
    press('ArrowRight');
    expect(focused().getAttribute('aria-label')).toBe('2029');
  });
});
