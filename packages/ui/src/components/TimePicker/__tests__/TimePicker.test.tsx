import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { TimePicker } from '../TimePicker';

const mockTheme = {
  colors: {
    gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'],
    primary: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'],
  },
  text: { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
};

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

describe('TimePicker - inline panel', () => {
  it('renders hour and minute columns, and no field chrome', () => {
    const { getByText, queryByText } = render(<TimePicker />);

    expect(getByText('Hour')).toBeTruthy();
    expect(getByText('Minute')).toBeTruthy();
    // The panel is selection-only: no Done button, no seconds unless asked.
    expect(queryByText('Done')).toBeNull();
    expect(queryByText('Second')).toBeNull();
  });

  it('adds the seconds and meridiem columns on request', () => {
    const { getByText } = render(<TimePicker withSeconds format={12} />);

    expect(getByText('Second')).toBeTruthy();
    expect(getByText('Period')).toBeTruthy();
    expect(getByText('AM')).toBeTruthy();
    expect(getByText('PM')).toBeTruthy();
  });

  it('emits the merged value when a column is picked', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <TimePicker value={{ hours: 10, minutes: 0 }} onChange={onChange} minuteStep={15} />
    );

    fireEvent.press(getByText('30'));

    expect(onChange).toHaveBeenCalledWith({ hours: 10, minutes: 30 });
  });

  it('fires onChangeComplete only for the final column', () => {
    const onChangeComplete = jest.fn();
    // Distinct steps keep the minute and second labels unambiguous.
    const { getByText } = render(
      <TimePicker
        defaultValue={{ hours: 10, minutes: 0, seconds: 0 }}
        withSeconds
        minuteStep={15}
        secondStep={20}
        onChangeComplete={onChangeComplete}
      />
    );

    // Minutes are not the last column once seconds are shown.
    fireEvent.press(getByText('45'));
    expect(onChangeComplete).not.toHaveBeenCalled();

    fireEvent.press(getByText('40'));
    expect(onChangeComplete).toHaveBeenCalledWith({ hours: 10, minutes: 45, seconds: 40 });
  });

  it('treats minutes as the final column when seconds are hidden', () => {
    const onChangeComplete = jest.fn();
    const { getByText } = render(
      <TimePicker value={{ hours: 10, minutes: 0 }} minuteStep={30} onChangeComplete={onChangeComplete} />
    );

    fireEvent.press(getByText('30'));

    expect(onChangeComplete).toHaveBeenCalledWith({ hours: 10, minutes: 30 });
  });

  it('ignores presses while disabled', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <TimePicker value={{ hours: 10, minutes: 0 }} minuteStep={30} onChange={onChange} disabled />
    );

    fireEvent.press(getByText('30'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
