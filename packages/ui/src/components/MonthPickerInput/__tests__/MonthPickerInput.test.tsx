import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MonthPickerInput } from '../MonthPickerInput';

jest.mock('../../Icon', () => {
  const { View } = require('react-native');
  return { Icon: () => <View /> };
});

describe('MonthPickerInput (native)', () => {
  it('is a button named by its label, reporting the formatted month', () => {
    render(<MonthPickerInput testID="mpi" label="Billing month" defaultValue={new Date(2026, 2, 1)} />);
    const trigger = screen.getByRole('button', { name: 'Billing month' });
    expect(trigger.props.accessibilityValue?.text).toBe('March 2026');
  });

  it('opens the month grid in a sheet and closes after a pick', () => {
    const onChange = jest.fn();
    render(<MonthPickerInput testID="mpi" label="Month" defaultValue={new Date(2026, 0, 1)} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('mpi-trigger'));
    fireEvent.press(screen.getByLabelText('May 2026'));
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getMonth()).toBe(4);
    expect(screen.getByText('May 2026')).toBeTruthy();
    expect(screen.queryByLabelText('June 2026')).toBeNull();
  });

  it('clears with the clear button', () => {
    const onChange = jest.fn();
    render(<MonthPickerInput testID="mpi" label="Month" clearable defaultValue={new Date(2026, 0, 1)} onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('Clear'));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText('Select month')).toBeTruthy();
  });
});
