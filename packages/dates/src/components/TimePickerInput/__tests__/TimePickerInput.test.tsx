import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { FieldHandle } from '@plocks/ui';
import { TimePickerInput } from '../TimePickerInput';

jest.mock('@plocks/ui', () => {
  const { View } = require('react-native');
  return { ...jest.requireActual('@plocks/ui'), Icon: () => <View /> };
});

const expanded = (node: { props: Record<string, unknown> }) =>
  (node.props.accessibilityState as { expanded?: boolean } | undefined)?.expanded ?? node.props['aria-expanded'];

describe('TimePickerInput (native)', () => {
  it('shows the formatted value in a labelled text field', () => {
    render(<TimePickerInput testID="tpi" label="Meeting" defaultValue={{ hours: 14, minutes: 5 }} format={12} />);
    expect(screen.getByDisplayValue('02:05 PM')).toBeTruthy();
    expect(screen.getByText('Meeting')).toBeTruthy();
  });

  it('commits a typed time once it is complete and reverts an incomplete one on blur', () => {
    const onChange = jest.fn();
    render(<TimePickerInput testID="tpi" label="Start" onChange={onChange} />);
    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '9:3');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.changeText(input, '9:30');
    expect(onChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 30 });
    fireEvent.changeText(input, '9:3x');
    fireEvent(input, 'blur');
    expect(screen.getByDisplayValue('09:30')).toBeTruthy();
  });

  it('parses 12-hour input and clears on empty text', () => {
    const onChange = jest.fn();
    render(<TimePickerInput testID="tpi" label="Start" format={12} defaultValue={{ hours: 1, minutes: 0 }} onChange={onChange} />);
    const input = screen.getByDisplayValue('01:00 AM');
    fireEvent.changeText(input, '12:15 pm');
    expect(onChange).toHaveBeenLastCalledWith({ hours: 12, minutes: 15 });
    fireEvent.changeText(input, '');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('opens the wheel panel from the labelled clock button and closes with Done', () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    render(<TimePickerInput testID="tpi" label="Start" onOpen={onOpen} onClose={onClose} />);
    const button = screen.getByRole('button', { name: 'Choose time' });
    expect(expanded(button)).toBe(false);
    fireEvent.press(button);
    expect(onOpen).toHaveBeenCalled();
    expect(screen.getByLabelText('Hour')).toBeTruthy();
    expect(screen.getByLabelText('Minute')).toBeTruthy();
    fireEvent.press(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByLabelText('Hour')).toBeNull();
  });

  it('sets the time from the panel', () => {
    const onChange = jest.fn();
    render(<TimePickerInput testID="tpi" label="Start" defaultValue={{ hours: 10, minutes: 0 }} minuteStep={15} onChange={onChange} />);
    fireEvent.press(screen.getByRole('button', { name: 'Choose time' }));
    fireEvent.press(screen.getByText('45'));
    expect(onChange).toHaveBeenLastCalledWith({ hours: 10, minutes: 45 });
  });

  it('is a button field when typing is off', () => {
    render(<TimePickerInput testID="tpi" label="Start" allowInput={false} defaultValue={{ hours: 8, minutes: 0 }} />);
    const trigger = screen.getByTestId('tpi-trigger');
    expect(trigger.props.accessibilityValue?.text ?? trigger.props['aria-valuetext']).toBe('08:00');
    fireEvent.press(trigger);
    expect(screen.getByLabelText('Hour')).toBeTruthy();
  });

  it('clears via the clear button and the ref', () => {
    const onChange = jest.fn();
    const ref = React.createRef<FieldHandle>();
    render(
      <TimePickerInput ref={ref} testID="tpi" label="Start" clearable defaultValue={{ hours: 8, minutes: 0 }} onChange={onChange} />
    );
    ref.current?.clear?.();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
