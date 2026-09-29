/**
 * DatePickerInput (native): the field is a button announcing label + value;
 * the calendar opens in the shared DropdownSheet with every day cell its own
 * accessibility element (nothing wraps it in `accessible`).
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { FieldHandle } from '../../../core/types/base';
import { DatePickerInput } from '../DatePickerInput';

jest.mock('../../Icon', () => {
  const { View } = require('react-native');
  return { Icon: () => <View /> };
});

const MARCH_2026 = new Date(2026, 2, 1);
const calendarProps = { defaultDate: MARCH_2026 };

// RN's Pressable turns aria-* into accessibilityState / accessibilityValue on the host view.
const a11y = (node: { props: Record<string, unknown> }) => ({
  label: (node.props.accessibilityLabel ?? node.props['aria-label']) as string | undefined,
  expanded: (node.props.accessibilityState as { expanded?: boolean } | undefined)?.expanded ?? node.props['aria-expanded'],
  valueText: (node.props.accessibilityValue as { text?: string } | undefined)?.text ?? node.props['aria-valuetext'],
});

const trigger = () => screen.getByTestId('dpi-trigger');
const dayCell = (label: string) => screen.getByLabelText(label);

describe('DatePickerInput (native)', () => {
  it('is a button named by its label that reports its value and expanded state', () => {
    render(<DatePickerInput testID="dpi" label="Start date" defaultValue={new Date(2026, 2, 3)} />);
    const button = screen.getByRole('button', { name: 'Start date' });
    expect(button).toBe(trigger());
    expect(a11y(button).valueText).toBe('March 3, 2026');
    expect(a11y(button).expanded).toBe(false);
    expect(screen.getByText('March 3, 2026')).toBeTruthy();
  });

  it('shows the placeholder and falls back to it as the name without a label', () => {
    render(<DatePickerInput testID="dpi" placeholder="When?" />);
    expect(screen.getByText('When?')).toBeTruthy();
    expect(a11y(trigger()).label).toBe('When?');
  });

  it('opens the calendar in a sheet and closes after picking a single date', () => {
    const onChange = jest.fn();
    const onOpen = jest.fn();
    const onClose = jest.fn();
    render(
      <DatePickerInput testID="dpi" label="Date" calendarProps={calendarProps} onChange={onChange} onOpen={onOpen} onClose={onClose} />
    );

    fireEvent.press(trigger());
    expect(onOpen).toHaveBeenCalled();
    expect(a11y(trigger()).expanded).toBe(true);
    // Each day is its own element with its full date as the name.
    fireEvent.press(dayCell('Tuesday, March 10, 2026'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(2);
    expect(picked.getDate()).toBe(10);
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByText('March 10, 2026')).toBeTruthy();
    expect(screen.queryByLabelText('Tuesday, March 10, 2026')).toBeNull();
  });

  it('picks a range and (with closeOnSelect) closes when both ends are set', () => {
    const onChange = jest.fn();
    render(
      <DatePickerInput testID="dpi" label="Stay" type="range" closeOnSelect calendarProps={calendarProps} onChange={onChange} />
    );
    fireEvent.press(trigger());
    fireEvent.press(dayCell('Monday, March 2, 2026'));
    expect(screen.getByLabelText('Friday, March 6, 2026')).toBeTruthy();
    fireEvent.press(dayCell('Friday, March 6, 2026'));
    const [start, end] = onChange.mock.calls[onChange.mock.calls.length - 1][0] as [Date, Date];
    expect(start.getDate()).toBe(2);
    expect(end.getDate()).toBe(6);
    expect(screen.getByText('March 2, 2026 – March 6, 2026')).toBeTruthy();
  });

  it('keeps multiple selection open until Done, with Clear', () => {
    const onChange = jest.fn();
    render(<DatePickerInput testID="dpi" label="Days" type="multiple" calendarProps={calendarProps} onChange={onChange} />);
    fireEvent.press(trigger());
    fireEvent.press(dayCell('Monday, March 2, 2026'));
    fireEvent.press(dayCell('Wednesday, March 4, 2026'));
    expect(screen.getByText('2 dates selected')).toBeTruthy();
    fireEvent.press(screen.getByText('Clear'));
    expect(onChange).toHaveBeenLastCalledWith([]);
    fireEvent.press(dayCell('Monday, March 2, 2026'));
    fireEvent.press(screen.getByText('Done'));
    expect(screen.queryByText('Done')).toBeNull();
    expect(a11y(trigger()).expanded).toBe(false);
  });

  it('closes from the sheet close button', () => {
    render(<DatePickerInput testID="dpi" label="Date" calendarProps={calendarProps} />);
    fireEvent.press(trigger());
    fireEvent.press(screen.getByLabelText('Close'));
    expect(a11y(trigger()).expanded).toBe(false);
  });

  it('clears with the labelled clear button and via the ref', () => {
    const onChange = jest.fn();
    const ref = React.createRef<FieldHandle>();
    render(
      <DatePickerInput
        ref={ref}
        testID="dpi"
        label="Date"
        clearable
        clearButtonLabel="Clear date"
        defaultValue={new Date(2026, 2, 3)}
        onChange={onChange}
      />
    );
    fireEvent.press(screen.getByLabelText('Clear date'));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByLabelText('Clear date')).toBeNull();

    onChange.mockClear();
    expect(typeof ref.current?.focus).toBe('function');
    ref.current?.clear?.();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('does not open when disabled or read-only', () => {
    const onOpen = jest.fn();
    const { rerender } = render(<DatePickerInput testID="dpi" label="Date" disabled onOpen={onOpen} />);
    fireEvent.press(trigger());
    rerender(<DatePickerInput testID="dpi" label="Date" readOnly onOpen={onOpen} />);
    fireEvent.press(trigger());
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('renders the error through the field frame', () => {
    render(<DatePickerInput testID="dpi" label="Date" error="Pick a date" required />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(a11y(trigger()).label).toBe('Date, required');
  });

  it('sizes the field root with the box props; an explicit `w` wins over `fullWidth`', () => {
    render(<DatePickerInput testID="dpi" label="Date" fullWidth w={240} maw={320} />);
    expect(StyleSheet.flatten(screen.getByTestId('dpi').props.style)).toMatchObject({ width: 240, maxWidth: 320 });
  });
});
