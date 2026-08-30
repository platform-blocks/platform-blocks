import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { Wheel } from '../Wheel';

const mockSelection = jest.fn();

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({ selection: mockSelection }),
}));

const mockTheme = {
  colors: {
    gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569', '#334155'],
    primary: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
  },
};

jest.mock('../../../core/theme', () => ({
  useTheme: () => mockTheme,
}));

const items = [
  { value: 0, label: '00' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
];

describe('Wheel', () => {
  beforeEach(() => mockSelection.mockClear());

  it('selects the item that crosses the center while spinning', () => {
    const onValueChange = jest.fn();
    const onChangeComplete = jest.fn();
    const { UNSAFE_getByType } = render(
      <Wheel
        label="Minute"
        items={items}
        value={0}
        onValueChange={onValueChange}
        onChangeComplete={onChangeComplete}
      />
    );
    const list = UNSAFE_getByType(FlatList);

    fireEvent.scroll(list, { nativeEvent: { contentOffset: { x: 0, y: 40 } } });
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 40 } },
    });

    expect(onValueChange).toHaveBeenCalledWith(15);
    expect(onChangeComplete).toHaveBeenCalledWith(15);
    expect(mockSelection).toHaveBeenCalledTimes(1);
  });

  it('scrolls tapped values to the center and completes the change', () => {
    const onValueChange = jest.fn();
    const onChangeComplete = jest.fn();
    const { getByText } = render(
      <Wheel
        label="Minute"
        items={items}
        value={0}
        onValueChange={onValueChange}
        onChangeComplete={onChangeComplete}
      />
    );

    fireEvent.press(getByText('30'));

    expect(onValueChange).toHaveBeenCalledWith(30);
    expect(onChangeComplete).toHaveBeenCalledWith(30);
  });

  it('settles a partial scroll offset on the nearest centered item', () => {
    jest.useFakeTimers();
    const { UNSAFE_getByType } = render(
      <Wheel label="Minute" items={items} value={0} />
    );
    const list = UNSAFE_getByType(FlatList);
    const scrollToOffset = jest.spyOn(list.instance, 'scrollToOffset');

    fireEvent.scroll(list, { nativeEvent: { contentOffset: { x: 0, y: 55 } } });
    act(() => jest.advanceTimersByTime(100));

    expect(scrollToOffset).toHaveBeenLastCalledWith({ offset: 40, animated: true });
    jest.useRealTimers();
  });

  it('supports assistive increment and decrement actions', () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = render(
      <Wheel label="Minute" items={items} defaultValue={15} onValueChange={onValueChange} />
    );

    fireEvent(getByLabelText('Minute'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onValueChange).toHaveBeenCalledWith(30);
  });

  it('ignores assistive actions while disabled', () => {
    const onValueChange = jest.fn();
    const onChangeComplete = jest.fn();
    const { getByLabelText } = render(
      <Wheel
        label="Minute"
        items={items}
        defaultValue={15}
        onValueChange={onValueChange}
        onChangeComplete={onChangeComplete}
        disabled
      />
    );

    fireEvent(getByLabelText('Minute'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onChangeComplete).not.toHaveBeenCalled();
  });
});