import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { YearPickerInput } from '../YearPickerInput';

jest.mock('@plocks/ui', () => {
  const { View } = require('react-native');
  return { ...jest.requireActual('@plocks/ui'), Icon: () => <View /> };
});

describe('YearPickerInput (native)', () => {
  it('is a button named by its label, reporting the year', () => {
    render(<YearPickerInput testID="ypi" label="Graduation" defaultValue={new Date(2024, 0, 1)} />);
    const trigger = screen.getByRole('button', { name: 'Graduation' });
    expect(trigger.props.accessibilityValue?.text).toBe('2024');
  });

  it('opens the year grid in a sheet and closes after a pick', () => {
    const onChange = jest.fn();
    render(<YearPickerInput testID="ypi" label="Year" defaultValue={new Date(2024, 0, 1)} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('ypi-trigger'));
    fireEvent.press(screen.getByLabelText('2027'));
    expect((onChange.mock.calls[0][0] as Date).getFullYear()).toBe(2027);
    expect(screen.getByText('2027')).toBeTruthy();
  });

  it('uses a custom formatter', () => {
    render(<YearPickerInput testID="ypi" label="Year" defaultValue={new Date(2024, 0, 1)} formatValue={(d) => `FY${d.getFullYear()}`} />);
    expect(screen.getByText('FY2024')).toBeTruthy();
  });
});
