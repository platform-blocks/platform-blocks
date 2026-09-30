import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { MonthPicker } from '../MonthPicker';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);
const focused = () => document.activeElement as HTMLElement;
const press = (key: string) =>
  act(() => {
    fireEvent.keyDown(focused(), { key });
  });

describe('MonthPicker (react-native-web DOM)', () => {
  it('renders a grid of named months with selected / current / disabled state', () => {
    const now = new Date();
    const year = now.getFullYear();
    render(
      <MonthPicker
        year={year}
        value={new Date(year, now.getMonth() === 0 ? 1 : 0, 1)}
        maxDate={new Date(year, 10, 30)}
      />
    );

    const grid = screen.getByRole('grid', { name: String(year) });
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(12);

    const currentName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);
    const current = screen.getByRole('gridcell', { name: currentName });
    if (now.getMonth() !== 11) {
      expect(current.getAttribute('aria-current')).toBe('date');
    }

    const selectedName = `${now.getMonth() === 0 ? 'February' : 'January'} ${year}`;
    expect(screen.getByRole('gridcell', { name: selectedName }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('gridcell', { name: `December ${year}` }).getAttribute('aria-disabled')).toBe('true');
  });

  it('labels the year controls and pages the year', () => {
    const onYearChange = jest.fn();
    render(<MonthPicker year={2026} onYearChange={onYearChange} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    });
    expect(onYearChange).toHaveBeenCalledWith(2027);
    expect(screen.getByRole('button', { name: 'Previous year' })).toBeTruthy();
  });

  it('roves focus through the grid with the arrow keys and selects with Space', () => {
    const onChange = jest.fn();
    render(<MonthPicker year={2026} value={new Date(2026, 4, 1)} onChange={onChange} monthsPerRow={3} />);

    const may = screen.getByRole('gridcell', { name: 'May 2026' });
    expect(may.getAttribute('tabindex')).toBe('0');
    act(() => {
      may.focus();
    });

    press('ArrowRight');
    expect(focused().getAttribute('aria-label')).toBe('June 2026');
    press('ArrowDown');
    expect(focused().getAttribute('aria-label')).toBe('September 2026');
    press('Home');
    expect(focused().getAttribute('aria-label')).toBe('July 2026');

    press(' ');
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 1));
  });
});
