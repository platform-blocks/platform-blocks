import { useState } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import type { AccessibilityActionEvent } from 'react-native';

import { useAdjustable, type UseAdjustableOptions } from '../useAdjustable';
import { keyEvent } from './keyEvent';

type Props = Partial<UseAdjustableOptions>;

const setup = ({ value: initialValue = 50, ...initial }: Props = {}) => {
  const onChangeEnd = jest.fn();
  const hook = renderHook(
    (props: Props) => {
      const [value, setValue] = useState(initialValue);
      const adjustable = useAdjustable({ value, min: 0, max: 100, step: 1, onChange: setValue, onChangeEnd, label: 'Volume', ...props });
      return { adjustable, value };
    },
    { initialProps: initial }
  );
  const press = (key: string, extra = {}) => {
    const event = keyEvent(key, extra);
    act(() => {
      hook.result.current.adjustable.handleKeyDown(event);
    });
    return event;
  };
  const action = (actionName: string) =>
    act(() => {
      hook.result.current.adjustable.adjustableProps.onAccessibilityAction?.({
        nativeEvent: { actionName },
      } as AccessibilityActionEvent);
    });
  return { ...hook, press, action, onChangeEnd };
};

describe('useAdjustable', () => {
  it('describes a slider with its range and native actions', () => {
    const { result } = setup({ valueText: (v) => `${v} percent` });
    const props = result.current.adjustable.adjustableProps;
    expect(props).toMatchObject({
      role: 'slider',
      'aria-label': 'Volume',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 50,
      'aria-valuetext': '50 percent',
    });
    expect(props.accessibilityActions?.map((a) => a.name)).toEqual(['increment', 'decrement']);
    // Keyboard wiring is web-only.
    expect(props.onKeyDown).toBeUndefined();
    expect(props.tabIndex).toBeUndefined();
  });

  it('increments/decrements through accessibility actions and commits each change', () => {
    const { result, action, onChangeEnd } = setup();
    action('increment');
    expect(result.current.value).toBe(51);
    action('decrement');
    action('decrement');
    expect(result.current.value).toBe(49);
    expect(onChangeEnd).toHaveBeenLastCalledWith(49);
    expect(onChangeEnd).toHaveBeenCalledTimes(3);
  });

  it('handles arrows (shift = coarse), PageUp/Down and Home/End', () => {
    const { result, press } = setup();
    expect(press('ArrowRight').preventDefault).toHaveBeenCalled();
    expect(result.current.value).toBe(51);
    press('ArrowUp', { shiftKey: true });
    expect(result.current.value).toBe(61);
    press('ArrowDown');
    expect(result.current.value).toBe(60);
    press('PageDown');
    expect(result.current.value).toBe(50);
    press('PageUp');
    expect(result.current.value).toBe(60);
    press('End');
    expect(result.current.value).toBe(100);
    press('ArrowRight'); // clamped
    expect(result.current.value).toBe(100);
    press('Home');
    expect(result.current.value).toBe(0);
    expect(press('Tab').preventDefault).not.toHaveBeenCalled();
  });

  it('swaps horizontal arrows under RTL but not vertical ones', () => {
    const { result, press } = setup({ rtl: true });
    press('ArrowLeft');
    expect(result.current.value).toBe(51);
    press('ArrowRight');
    expect(result.current.value).toBe(50);
    press('ArrowUp');
    expect(result.current.value).toBe(51);

    const vertical = setup({ rtl: true, orientation: 'vertical' });
    vertical.press('ArrowRight');
    expect(vertical.result.current.value).toBe(51);
  });

  it('builds on the latest value across rapid presses before a re-render', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useAdjustable({ value: 10, min: 0, max: 100, onChange }));
    act(() => {
      result.current.handleKeyDown(keyEvent('ArrowRight'));
      result.current.handleKeyDown(keyEvent('ArrowRight'));
    });
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([11, 12]);
  });

  it('avoids floating point drift for fractional steps', () => {
    const { result, press } = setup({ value: 0.1, step: 0.1, max: 1 });
    press('ArrowRight');
    press('ArrowRight');
    expect(result.current.value).toBe(0.3);
  });

  it('does nothing when disabled or read-only', () => {
    const disabled = setup({ disabled: true });
    expect(disabled.press('ArrowRight').preventDefault).not.toHaveBeenCalled();
    expect(disabled.result.current.value).toBe(50);
    expect(disabled.result.current.adjustable.adjustableProps['aria-disabled']).toBe(true);
    expect(disabled.result.current.adjustable.adjustableProps.accessibilityActions).toBeUndefined();

    const readOnly = setup({ readOnly: true });
    readOnly.action('increment');
    expect(readOnly.result.current.value).toBe(50);
  });

  it('supports custom stepping (detents) and endless controls', () => {
    const marks = [0, 25, 50, 75, 100];
    const detents = setup({
      getNextValue: (current, dir) =>
        dir > 0 ? marks.find((m) => m > current) ?? current : [...marks].reverse().find((m) => m < current) ?? current,
    });
    detents.press('ArrowRight');
    expect(detents.result.current.value).toBe(75);

    const endless = setup({ endless: true, value: 100 });
    endless.press('ArrowRight');
    expect(endless.result.current.value).toBe(101);
    expect(endless.press('Home').preventDefault).not.toHaveBeenCalled();
    expect(endless.result.current.adjustable.adjustableProps['aria-valuemin']).toBeUndefined();
  });
});
