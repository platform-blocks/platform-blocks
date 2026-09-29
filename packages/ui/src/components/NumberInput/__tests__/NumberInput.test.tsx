import React, { createRef, useState } from 'react';
import { AccessibilityInfo, TextInput } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { NumberInput } from '../NumberInput';

const getInput = () => screen.UNSAFE_getByType(TextInput);

describe('NumberInput (native)', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('forwards its ref to the TextInput', () => {
    const ref = createRef<TextInput>();
    render(<NumberInput label="Qty" ref={ref} />);
    expect(ref.current).toBe(getInput().instance);
  });

  it('works uncontrolled from defaultValue', () => {
    const onChange = jest.fn();
    render(<NumberInput label="Qty" defaultValue={3} onChange={onChange} />);
    expect(getInput().props.value).toBe('3');

    fireEvent(getInput(), 'focus');
    fireEvent.changeText(getInput(), '12');
    expect(onChange).toHaveBeenLastCalledWith(12);
    fireEvent(getInput(), 'blur');
    expect(getInput().props.value).toBe('12');
  });

  it('keeps a controlled value where the parent puts it', () => {
    render(<NumberInput label="Qty" value={5} />);
    fireEvent(getInput(), 'focus');
    fireEvent.changeText(getInput(), '9');
    fireEvent(getInput(), 'blur');
    expect(getInput().props.value).toBe('5');
  });

  it('treats value={undefined} as a controlled empty field', () => {
    const Controlled = () => {
      const [value, setValue] = useState<number | undefined>(undefined);
      return <NumberInput label="Qty" value={value} onChange={setValue} />;
    };
    render(<Controlled />);
    fireEvent(getInput(), 'focus');
    fireEvent.changeText(getInput(), '4');
    expect(getInput().props.value).toBe('4');
    fireEvent.changeText(getInput(), '');
    expect(getInput().props.value).toBe('');
  });

  it('keeps a partial entry while editing', () => {
    render(<NumberInput label="Amount" defaultValue={1} />);
    fireEvent(getInput(), 'focus');
    fireEvent.changeText(getInput(), '1.');
    expect(getInput().props.value).toBe('1.');
    fireEvent.changeText(getInput(), '-');
    expect(getInput().props.value).toBe('-');
  });

  it('formats when not focused', () => {
    render(<NumberInput label="Price" defaultValue={1234.5} thousandSeparator="," prefix="$" decimalScale={2} fixedDecimalScale />);
    expect(getInput().props.value).toBe('$1,234.50');
  });

  it('steps with labelled side buttons and respects bounds', () => {
    const onChange = jest.fn();
    render(<NumberInput label="Qty" defaultValue={1} min={0} max={2} withSideButtons onChange={onChange} />);

    fireEvent(screen.getByLabelText('Increase value'), 'pressIn');
    fireEvent(screen.getByLabelText('Increase value'), 'pressOut');
    expect(onChange).toHaveBeenLastCalledWith(2);

    fireEvent(screen.getByLabelText('Decrease value'), 'pressIn');
    fireEvent(screen.getByLabelText('Decrease value'), 'pressOut');
    fireEvent(screen.getByLabelText('Decrease value'), 'pressIn');
    fireEvent(screen.getByLabelText('Decrease value'), 'pressOut');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('steps with hardware arrow keys', () => {
    const onChange = jest.fn();
    render(<NumberInput label="Qty" defaultValue={10} onChange={onChange} />);
    fireEvent(getInput(), 'keyPress', { nativeEvent: { key: 'ArrowUp' } });
    expect(onChange).toHaveBeenLastCalledWith(11);
    fireEvent(getInput(), 'keyPress', { nativeEvent: { key: 'ArrowDown' } });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('clamps on blur', () => {
    const onChange = jest.fn();
    render(<NumberInput label="Qty" defaultValue={1} max={10} onChange={onChange} />);
    fireEvent(getInput(), 'focus');
    fireEvent.changeText(getInput(), '50');
    fireEvent(getInput(), 'blur');
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(getInput().props.value).toBe('10');
  });
});
