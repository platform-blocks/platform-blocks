import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MiniCalendar } from '../MiniCalendar';

const date = (day: number) => new Date(2026, 2, day);

describe('MiniCalendar', () => {
  it('selects a day and keeps dates before minDate disabled', () => {
    const onChange = jest.fn();
    render(<MiniCalendar defaultValue={date(12)} minDate={date(10)} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Monday, March 9, 2026', disabled: true })).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Friday, March 13, 2026' }));
    expect(onChange).toHaveBeenCalledWith(date(13));
    expect(screen.getByRole('button', { name: 'Friday, March 13, 2026', selected: true })).toBeTruthy();
  });

  it('pages by the configured number of days', () => {
    render(<MiniCalendar defaultDate={date(12)} numberOfDays={5} />);
    fireEvent.press(screen.getByRole('button', { name: 'Next 5 days' }));
    expect(screen.getByRole('button', { name: 'Tuesday, March 17, 2026' })).toBeTruthy();
  });
});
