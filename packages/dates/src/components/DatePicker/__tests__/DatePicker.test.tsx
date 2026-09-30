import React from 'react';
import { StyleSheet, type View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { DatePicker } from '../DatePicker';
import { extractFirstDate } from '../utils';

// March 2026 starts on a Sunday; en-US names days "Tuesday, March 3, 2026".
const MARCH = new Date(2026, 2, 1);
const day = (d: number, month = 2) => new Date(2026, month, d);
const dayButton = (name: string, options: { selected?: boolean; disabled?: boolean } = {}) =>
  screen.getByRole('button', { name, ...options });

describe('DatePicker', () => {
  it('names each day with its full date and selects it (single)', () => {
    const onChange = jest.fn();
    render(<DatePicker onChange={onChange} calendarProps={{ defaultDate: MARCH }} />);

    fireEvent.press(dayButton('Tuesday, March 3, 2026'));
    expect(onChange).toHaveBeenCalledWith(day(3));
    expect(dayButton('Tuesday, March 3, 2026', { selected: true })).toBeTruthy();
  });

  it('shows a controlled value as selected', () => {
    render(<DatePicker value={day(10)} calendarProps={{ defaultDate: MARCH }} />);

    expect(dayButton('Tuesday, March 10, 2026', { selected: true })).toBeTruthy();
    expect(dayButton('Wednesday, March 11, 2026', { selected: false })).toBeTruthy();
  });

  it('builds a range from two presses', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <DatePicker type="range" value={[null, null]} onChange={onChange} calendarProps={{ defaultDate: MARCH }} />
    );

    fireEvent.press(dayButton('Thursday, March 5, 2026'));
    expect(onChange).toHaveBeenLastCalledWith([day(5), null]);

    rerender(
      <DatePicker type="range" value={[day(5), null]} onChange={onChange} calendarProps={{ defaultDate: MARCH }} />
    );
    fireEvent.press(dayButton('Tuesday, March 3, 2026'));
    // An end before the start swaps them.
    expect(onChange).toHaveBeenLastCalledWith([day(3), day(5)]);
  });

  it('toggles days in multiple mode (uncontrolled)', () => {
    const onChange = jest.fn();
    render(<DatePicker type="multiple" onChange={onChange} calendarProps={{ defaultDate: MARCH }} />);

    fireEvent.press(dayButton('Monday, March 2, 2026'));
    fireEvent.press(dayButton('Friday, March 6, 2026'));
    expect(onChange).toHaveBeenLastCalledWith([day(2), day(6)]);

    fireEvent.press(dayButton('Monday, March 2, 2026'));
    expect(onChange).toHaveBeenLastCalledWith([day(6)]);
  });

  it('brings a value that is out of view into view, but never shifts a visible one', () => {
    const { rerender } = render(
      <DatePicker value={day(10)} calendarProps={{ defaultDate: MARCH, numberOfMonths: 2 }} />
    );
    expect(screen.getByText('March 2026')).toBeTruthy();

    // April is the second visible month: the view stays put.
    rerender(<DatePicker value={day(8, 3)} calendarProps={{ defaultDate: MARCH, numberOfMonths: 2 }} />);
    expect(screen.getByText('March 2026')).toBeTruthy();

    // July is off screen: the view jumps to it.
    rerender(<DatePicker value={day(8, 6)} calendarProps={{ defaultDate: MARCH, numberOfMonths: 2 }} />);
    expect(screen.getByText('July 2026')).toBeTruthy();
  });

  it('navigates months with labelled controls and reports the view date', () => {
    const onDateChange = jest.fn();
    render(<DatePicker calendarProps={{ defaultDate: new Date(2026, 0, 31), onDateChange }} />);

    fireEvent.press(screen.getByRole('button', { name: 'Next month' }));
    // Jan 31 + 1 month is February (clamped), not March 3.
    expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 1, 28));
    expect(screen.getByText('February 2026')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('January 2026')).toBeTruthy();
  });

  it('switches to the month grid from the header', () => {
    const onLevelChange = jest.fn();
    render(<DatePicker calendarProps={{ defaultDate: MARCH, onLevelChange }} />);

    fireEvent.press(screen.getByRole('button', { name: 'March 2026' }));
    expect(onLevelChange).toHaveBeenCalledWith('year');
    expect(screen.getByRole('button', { name: 'Previous year' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'June 2026' })).toBeTruthy();
  });

  it('disables days before minDate', () => {
    const onChange = jest.fn();
    render(<DatePicker onChange={onChange} calendarProps={{ defaultDate: MARCH, minDate: day(10) }} />);

    fireEvent.press(dayButton('Monday, March 9, 2026', { disabled: true }));
    expect(onChange).not.toHaveBeenCalled();
    expect(dayButton('Tuesday, March 10, 2026', { disabled: false })).toBeTruthy();
  });

  it('labels the calendar as a group without collapsing its days into one element', () => {
    render(<DatePicker testID="picker" accessibilityLabel="Travel dates" calendarProps={{ defaultDate: MARCH }} />);

    const root = screen.getByTestId('picker');
    expect(root.props.role).toBe('group');
    expect(root.props['aria-label']).toBe('Travel dates');
    expect(root.props.accessible).not.toBe(true);
    // Days are still individually reachable.
    expect(dayButton('Tuesday, March 3, 2026')).toBeTruthy();
  });

  it('forwards ref, style and spacing props to the root view', () => {
    const ref = React.createRef<View>();
    render(<DatePicker ref={ref} testID="picker" style={{ opacity: 0.5 }} p="sm" />);

    expect(ref.current).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('picker').props.style)).toMatchObject({
      opacity: 0.5,
      paddingTop: 8,
    });
  });
});

describe('extractFirstDate', () => {
  it('finds the first real date in any value shape', () => {
    expect(extractFirstDate(null)).toBeUndefined();
    expect(extractFirstDate(day(1))).toEqual(day(1));
    expect(extractFirstDate([null, day(2)])).toEqual(day(2));
    expect(extractFirstDate([])).toBeUndefined();
  });
});
