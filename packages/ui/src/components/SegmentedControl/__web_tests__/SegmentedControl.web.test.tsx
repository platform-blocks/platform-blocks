import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { DirectionProvider } from '../../../core/providers/DirectionProvider';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { SegmentedControl } from '../SegmentedControl';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

const DATA = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', disabled: true },
  { value: 'year', label: 'Year' },
];

describe('SegmentedControl (react-native-web DOM)', () => {
  it('is a radiogroup of radios with aria-checked (not aria-selected), named by its label', () => {
    render(<SegmentedControl label="Range" defaultValue="week" data={DATA} />);
    const group = screen.getByRole('radiogroup', { name: 'Range' });
    expect(group).toBeTruthy();
    const week = screen.getByRole('radio', { name: 'Week' });
    expect(week.getAttribute('aria-checked')).toBe('true');
    expect(week.getAttribute('aria-selected')).toBeNull();
    expect(screen.getByRole('radio', { name: 'Day' }).getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('radio', { name: 'Month' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('arrow keys move focus and select, skipping disabled segments (one tab stop)', () => {
    const onChange = jest.fn();
    render(<SegmentedControl accessibilityLabel="Range" defaultValue="week" onChange={onChange} data={DATA} />);
    const week = screen.getByRole('radio', { name: 'Week' });
    const year = screen.getByRole('radio', { name: 'Year' });
    expect(week.getAttribute('tabindex')).toBe('0');
    expect(year.getAttribute('tabindex')).toBe('-1');

    week.focus();
    fireEvent.keyDown(week, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(year);
    expect(onChange).toHaveBeenCalledWith('year');
    expect(year.getAttribute('aria-checked')).toBe('true');

    fireEvent.keyDown(year, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('day');
  });

  it('mirrors arrow keys under RTL', () => {
    const onChange = jest.fn();
    render(
      <DirectionProvider initialDirection="rtl">
        <SegmentedControl accessibilityLabel="Range" defaultValue="day" onChange={onChange} data={DATA} />
      </DirectionProvider>
    );
    const day = screen.getByRole('radio', { name: 'Day' });
    day.focus();
    // In RTL the next segment is to the left: ArrowLeft moves forward.
    fireEvent.keyDown(day, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('week');
  });
});
