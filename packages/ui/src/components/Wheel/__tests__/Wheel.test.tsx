import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { Wheel } from '../Wheel';

const mockSelection = jest.fn();

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({ selection: mockSelection }),
}));

// Text inside Wheel reads the same (mocked) useTheme, so start from the real
// default theme and override only the palettes this test cares about.
const mockDefaultTheme = jest.requireActual('../../../core/theme/defaultTheme').DEFAULT_THEME;
const mockTheme = {
  ...mockDefaultTheme,
  colors: {
    ...mockDefaultTheme.colors,
    gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569', '#334155'],
    primary: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
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
    const onChange = jest.fn();
    const onChangeComplete = jest.fn();
    const { UNSAFE_getByType } = render(
      <Wheel
        label="Minute"
        items={items}
        value={0}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    );
    const list = UNSAFE_getByType(FlatList);

    fireEvent.scroll(list, { nativeEvent: { contentOffset: { x: 0, y: 40 } } });
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 40 } },
    });

    expect(onChange).toHaveBeenCalledWith(15);
    expect(onChangeComplete).toHaveBeenCalledWith(15);
    expect(mockSelection).toHaveBeenCalledTimes(1);
  });

  it('scrolls tapped values to the center and completes the change', () => {
    const onChange = jest.fn();
    const onChangeComplete = jest.fn();
    const { getByText } = render(
      <Wheel
        label="Minute"
        items={items}
        value={0}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    );

    fireEvent.press(getByText('30'));

    expect(onChange).toHaveBeenCalledWith(30);
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
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <Wheel label="Minute" items={items} defaultValue={15} onChange={onChange} />
    );

    fireEvent(getByLabelText('Minute'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('ignores assistive actions while disabled', () => {
    const onChange = jest.fn();
    const onChangeComplete = jest.fn();
    const { getByLabelText } = render(
      <Wheel
        label="Minute"
        items={items}
        defaultValue={15}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
        disabled
      />
    );

    fireEvent(getByLabelText('Minute'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeComplete).not.toHaveBeenCalled();
  });

  it('exposes one adjustable control whose value text is the centered label', () => {
    const { getByLabelText } = render(<Wheel label="Minute" items={items} defaultValue={15} />);
    const wheel = getByLabelText('Minute');
    expect(wheel.props.role).toBe('slider');
    expect(wheel.props['aria-valuenow']).toBe(1);
    expect(wheel.props['aria-valuetext']).toBe('15');
  });
});
