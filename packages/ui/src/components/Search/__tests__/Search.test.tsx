import React, { createRef } from 'react';
import { TextInput } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Search } from '../Search';

const getInput = () => screen.UNSAFE_getByType(TextInput);

describe('Search (native)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports typing through onChangeText and forwards its ref', () => {
    const ref = createRef<TextInput>();
    const onChangeText = jest.fn();
    render(<Search ref={ref} onChangeText={onChangeText} />);
    fireEvent.changeText(getInput(), 'shoes');
    expect(onChangeText).toHaveBeenCalledWith('shoes');
    expect(getInput().props.value).toBe('shoes');
    expect(ref.current).toBe(getInput().instance);
  });

  it('does not write its own state when controlled', () => {
    render(<Search value="boots" onChangeText={() => {}} />);
    fireEvent.changeText(getInput(), 'shoes');
    expect(getInput().props.value).toBe('boots');
  });

  it('debounces onChangeText but shows typing immediately, even when controlled', () => {
    jest.useFakeTimers();
    try {
      const onChangeText = jest.fn();
      render(<Search value="" onChangeText={onChangeText} debounce={200} />);
      fireEvent.changeText(getInput(), 'sho');
      expect(getInput().props.value).toBe('sho');
      expect(onChangeText).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(onChangeText).toHaveBeenCalledWith('sho');
    } finally {
      jest.useRealTimers();
    }
  });

  it('clears with a labelled button and submits the empty query', () => {
    const onSubmit = jest.fn();
    const onChangeText = jest.fn();
    render(<Search defaultValue="socks" onSubmit={onSubmit} onChangeText={onChangeText} />);
    fireEvent.press(screen.getByLabelText('Clear search'));
    expect(onChangeText).toHaveBeenLastCalledWith('');
    expect(onSubmit).toHaveBeenLastCalledWith('');
    expect(getInput().props.value).toBe('');
  });

  it('submits the query on Enter', () => {
    const onSubmit = jest.fn();
    render(<Search defaultValue="gloves" onSubmit={onSubmit} />);
    fireEvent(getInput(), 'submitEditing');
    expect(onSubmit).toHaveBeenCalledWith('gloves');
  });

  it('renders a named button in buttonMode', () => {
    const onPress = jest.fn();
    render(<Search buttonMode onPress={onPress} accessibilityLabel="Open search" />);
    fireEvent.press(screen.getByLabelText('Open search'));
    expect(onPress).toHaveBeenCalled();
  });
});
