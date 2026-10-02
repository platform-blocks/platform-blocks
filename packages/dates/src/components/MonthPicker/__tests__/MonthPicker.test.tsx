import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MonthPicker } from '../MonthPicker';

describe('MonthPicker', () => {
  it('selects an enabled month and prevents dates beyond the limit', () => {
    const onChange = jest.fn();
    render(<MonthPicker year={2026} maxDate={new Date(2026, 5, 30)} onChange={onChange} />);

    fireEvent.press(screen.getByRole('button', { name: 'March 2026' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 1));
    expect(screen.getByRole('button', { name: 'December 2026', disabled: true })).toBeTruthy();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reports a requested year change', () => {
    const onYearChange = jest.fn();
    render(<MonthPicker year={2026} onYearChange={onYearChange} />);
    fireEvent.press(screen.getByRole('button', { name: 'Next year' }));
    expect(onYearChange).toHaveBeenCalledWith(2027);
  });
});
