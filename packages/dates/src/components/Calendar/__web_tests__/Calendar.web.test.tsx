import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { Calendar } from '../Calendar';
import type { CalendarProps } from '../types';
import { formatFullDate } from '../utils';

const render = (ui: React.ReactElement, direction: 'ltr' | 'rtl' = 'ltr') =>
  rtlRender(<PlocksProvider direction={{ initialDirection: direction }}>{ui}</PlocksProvider>);

// March 2026: the 1st is a Sunday, the 31st a Tuesday.
const MARCH = new Date(2026, 2, 1);
const cell = (name: string) => screen.getByRole('gridcell', { name });
const focused = () => document.activeElement as HTMLElement;
const press = (key: string, options: Partial<KeyboardEventInit> = {}) =>
  act(() => {
    fireEvent.keyDown(focused(), { key, ...options });
  });

const renderMarch = (props: Partial<CalendarProps> = {}, direction: 'ltr' | 'rtl' = 'ltr') =>
  render(<Calendar defaultDate={MARCH} highlightToday={false} {...props} />, direction);

describe('Calendar (react-native-web DOM)', () => {
  it('renders a labelled grid with weekday column headers and full-date day cells', () => {
    renderMarch();

    const grid = screen.getByRole('grid', { name: 'March 2026' });
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers.map((h) => h.getAttribute('aria-label'))).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
    // Header row + six weeks.
    expect(within(grid).getAllByRole('row')).toHaveLength(7);
    expect(cell('Tuesday, March 3, 2026')).toBeTruthy();
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(42);
  });

  it('marks the selected day with aria-selected and today with aria-current="date"', () => {
    const today = new Date();
    render(<Calendar value={today} />);

    const todayCell = cell(formatFullDate(today, 'en-US'));
    expect(todayCell.getAttribute('aria-selected')).toBe('true');
    expect(todayCell.getAttribute('aria-current')).toBe('date');

    const other = screen
      .getAllByRole('gridcell')
      .find((node) => node.getAttribute('aria-selected') === 'false');
    expect(other).toBeTruthy();
    expect(other?.getAttribute('aria-current')).toBeNull();
  });

  it('marks disabled days with aria-disabled', () => {
    renderMarch({ minDate: new Date(2026, 2, 10) });

    expect(cell('Monday, March 9, 2026').getAttribute('aria-disabled')).toBe('true');
    expect(cell('Tuesday, March 10, 2026').getAttribute('aria-disabled')).not.toBe('true');
  });

  it('labels the navigation controls per level and hides the chevron icons', () => {
    renderMarch();

    const next = screen.getByRole('button', { name: 'Next month' });
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeTruthy();
    expect(next.querySelector('[aria-hidden="true"]')).toBeTruthy();

    act(() => {
      fireEvent.click(next);
    });
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeTruthy();

    const header = screen.getByRole('button', { name: 'April 2026, Show months' });
    expect(header.getAttribute('aria-live')).toBe('polite');
    act(() => {
      fireEvent.click(header);
    });
    expect(screen.getByRole('button', { name: 'Previous year' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next year' })).toBeTruthy();
    expect(screen.getByRole('gridcell', { name: 'April 2026' }).getAttribute('aria-selected')).toBe('true');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '2026, Show years' }));
    });
    expect(screen.getByRole('button', { name: 'Previous decade' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next decade' })).toBeTruthy();
    expect(screen.getByRole('gridcell', { name: '2031' })).toBeTruthy();
  });

  it('has one tab stop, on the selected day', () => {
    renderMarch({ value: new Date(2026, 2, 12) });

    const stops = screen.getAllByRole('gridcell').filter((node) => node.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
    expect(stops[0].getAttribute('aria-label')).toBe('Thursday, March 12, 2026');
  });

  it('moves focus with the arrow keys, Home/End and across months', () => {
    renderMarch({ value: new Date(2026, 2, 12) });
    act(() => {
      cell('Thursday, March 12, 2026').focus();
    });

    press('ArrowRight');
    expect(focused().getAttribute('aria-label')).toBe('Friday, March 13, 2026');
    expect(focused().getAttribute('tabindex')).toBe('0');

    press('ArrowDown');
    expect(focused().getAttribute('aria-label')).toBe('Friday, March 20, 2026');

    press('ArrowLeft');
    expect(focused().getAttribute('aria-label')).toBe('Thursday, March 19, 2026');

    press('ArrowUp');
    expect(focused().getAttribute('aria-label')).toBe('Thursday, March 12, 2026');

    press('Home');
    expect(focused().getAttribute('aria-label')).toBe('Sunday, March 8, 2026');

    press('End');
    expect(focused().getAttribute('aria-label')).toBe('Saturday, March 14, 2026');

    // Past the end of the month: the view moves to April and focus follows.
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    expect(focused().getAttribute('aria-label')).toBe('Saturday, April 4, 2026');
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeTruthy();

    // PageUp / PageDown change the month, keeping the day.
    press('PageUp');
    expect(focused().getAttribute('aria-label')).toBe('Wednesday, March 4, 2026');
    press('PageDown', { shiftKey: true });
    expect(focused().getAttribute('aria-label')).toBe('Thursday, March 4, 2027');
  });

  it('skips disabled days', () => {
    renderMarch({ value: new Date(2026, 2, 12), excludeDate: (date) => date.getDate() === 13 });
    act(() => {
      cell('Thursday, March 12, 2026').focus();
    });

    press('ArrowRight');
    expect(focused().getAttribute('aria-label')).toBe('Saturday, March 14, 2026');
  });

  it('swaps the horizontal arrows in RTL', () => {
    renderMarch({ value: new Date(2026, 2, 12) }, 'rtl');
    act(() => {
      cell('Thursday, March 12, 2026').focus();
    });

    press('ArrowLeft');
    expect(focused().getAttribute('aria-label')).toBe('Friday, March 13, 2026');
    press('ArrowRight');
    expect(focused().getAttribute('aria-label')).toBe('Thursday, March 12, 2026');
  });

  it('selects the focused day with Space and Enter', () => {
    const onChange = jest.fn();
    renderMarch({ onChange });
    act(() => {
      cell('Thursday, March 12, 2026').focus();
    });

    press(' ');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 12));

    press('ArrowRight');
    // react-native-web's Pressable activates on Enter's keyup.
    act(() => {
      fireEvent.keyDown(focused(), { key: 'Enter' });
      fireEvent.keyUp(focused(), { key: 'Enter' });
    });
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 13));
  });

  it('is display-only in static mode', () => {
    const onChange = jest.fn();
    renderMarch({ static: true, onChange });

    act(() => {
      fireEvent.click(cell('Thursday, March 12, 2026'));
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole('gridcell').every((node) => node.getAttribute('tabindex') !== '0')).toBe(true);
    expect(screen.getByRole('button', { name: 'Next month' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps a single tab stop across multiple months', () => {
    renderMarch({ numberOfMonths: 2, value: new Date(2026, 3, 8) });

    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeTruthy();
    const april = screen.getByRole('grid', { name: 'April 2026' });
    const stops = screen.getAllByRole('gridcell').filter((node) => node.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
    expect(within(april).getByRole('gridcell', { name: 'Wednesday, April 8, 2026' })).toBe(stops[0]);
  });
});
