import { act, renderHook } from '@testing-library/react-native';

import { useRovingFocus, type UseRovingFocusOptions } from '../useRovingFocus';
import { keyEvent } from './keyEvent';

const setup = (options: Partial<UseRovingFocusOptions> = {}) => {
  const onActiveChange = jest.fn();
  const hook = renderHook((props: Partial<UseRovingFocusOptions>) =>
    useRovingFocus({ count: 4, onActiveChange, ...options, ...props }), { initialProps: {} });
  return { ...hook, onActiveChange };
};

const press = (result: { current: ReturnType<typeof useRovingFocus> }, index: number, key: string, extra = {}) => {
  const event = keyEvent(key, extra);
  act(() => {
    result.current.getItemProps(index).onKeyDown(event);
  });
  return event;
};

describe('useRovingFocus', () => {
  it('gives the active item the only tab stop', () => {
    const { result } = setup({ defaultActiveIndex: 2 });
    expect([0, 1, 2, 3].map((i) => result.current.getItemProps(i).tabIndex)).toEqual([-1, -1, 0, -1]);
  });

  it('moves with horizontal arrows and ignores vertical ones', () => {
    const { result, onActiveChange } = setup();
    const event = press(result, 0, 'ArrowRight');
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onActiveChange).toHaveBeenLastCalledWith(1);
    expect(result.current.activeIndex).toBe(1);

    const down = press(result, 1, 'ArrowDown');
    expect(down.preventDefault).not.toHaveBeenCalled();
    expect(result.current.activeIndex).toBe(1);

    press(result, 1, 'ArrowLeft');
    expect(result.current.activeIndex).toBe(0);
  });

  it('wraps when loop is on and stops at the ends when off', () => {
    const looping = setup({ defaultActiveIndex: 3 });
    press(looping.result, 3, 'ArrowRight');
    expect(looping.result.current.activeIndex).toBe(0);

    const clamped = setup({ defaultActiveIndex: 3, loop: false });
    press(clamped.result, 3, 'ArrowRight');
    expect(clamped.result.current.activeIndex).toBe(3);
    expect(clamped.onActiveChange).not.toHaveBeenCalled();
  });

  it('swaps horizontal arrows under RTL', () => {
    const { result } = setup({ rtl: true });
    press(result, 0, 'ArrowLeft');
    expect(result.current.activeIndex).toBe(1);
    press(result, 1, 'ArrowRight');
    expect(result.current.activeIndex).toBe(0);
  });

  it('uses Up/Down for vertical groups', () => {
    const { result } = setup({ orientation: 'vertical' });
    press(result, 0, 'ArrowDown');
    expect(result.current.activeIndex).toBe(1);
    const right = press(result, 1, 'ArrowRight');
    expect(right.preventDefault).not.toHaveBeenCalled();
    press(result, 1, 'ArrowUp');
    expect(result.current.activeIndex).toBe(0);
  });

  it('jumps with Home/End and skips disabled items everywhere', () => {
    const { result } = setup({ count: 5, isDisabled: (i) => i === 1 || i === 4 });
    press(result, 0, 'ArrowRight');
    expect(result.current.activeIndex).toBe(2);
    press(result, 2, 'End');
    expect(result.current.activeIndex).toBe(3);
    press(result, 3, 'Home');
    expect(result.current.activeIndex).toBe(0);
  });

  it('moves the tab stop off a disabled requested item', () => {
    const { result } = setup({ activeIndex: 0, isDisabled: (i) => i === 0 });
    expect(result.current.activeIndex).toBe(1);
    expect(result.current.getItemProps(1).tabIndex).toBe(0);
  });

  it('moves by rows in a grid and keeps Home/End within the row', () => {
    const { result } = setup({ count: 14, orientation: 'both', columns: 7, defaultActiveIndex: 3 });
    press(result, 3, 'ArrowDown');
    expect(result.current.activeIndex).toBe(10);
    press(result, 10, 'ArrowDown'); // no row below: stays (grids don't wrap vertically)
    expect(result.current.activeIndex).toBe(10);
    press(result, 10, 'Home');
    expect(result.current.activeIndex).toBe(7);
    press(result, 7, 'End');
    expect(result.current.activeIndex).toBe(13);
    press(result, 13, 'Home', { ctrlKey: true });
    expect(result.current.activeIndex).toBe(0);
    press(result, 0, 'ArrowRight');
    expect(result.current.activeIndex).toBe(1);
  });

  it('typeahead jumps to the next item starting with the typed text', () => {
    jest.useFakeTimers();
    try {
      const labels = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Blackberry'];
      const { result } = setup({ count: 5, typeahead: (i) => labels[i] });
      press(result, 0, 'b');
      expect(result.current.activeIndex).toBe(1);
      press(result, 1, 'b'); // repeated letter cycles
      expect(result.current.activeIndex).toBe(2);
      act(() => jest.advanceTimersByTime(600)); // buffer resets
      press(result, 2, 'c');
      expect(result.current.activeIndex).toBe(3);
      act(() => jest.advanceTimersByTime(600));
      press(result, 3, 'b');
      press(result, 4, 'l');
      press(result, 4, 'a'); // "bla" → Blackberry
      expect(result.current.activeIndex).toBe(4);
    } finally {
      jest.useRealTimers();
    }
  });

  it('leaves Shift+Arrow and unrelated keys to the consumer', () => {
    const { result } = setup();
    expect(press(result, 0, 'ArrowRight', { shiftKey: true }).preventDefault).not.toHaveBeenCalled();
    expect(press(result, 0, 'Enter').preventDefault).not.toHaveBeenCalled();
    expect(result.current.activeIndex).toBe(0);
  });

  it('syncs the active index when an item receives focus', () => {
    const { result, onActiveChange } = setup();
    act(() => result.current.getItemProps(2).onFocus());
    expect(onActiveChange).toHaveBeenCalledWith(2);
    expect(result.current.activeIndex).toBe(2);
  });

  it('only reports changes when controlled', () => {
    const { result, onActiveChange } = setup({ activeIndex: 1 });
    press(result, 1, 'ArrowRight');
    expect(onActiveChange).toHaveBeenCalledWith(2);
    expect(result.current.activeIndex).toBe(1);
  });

  it('keeps ref callbacks stable per index', () => {
    const { result, rerender } = setup();
    const ref = result.current.getItemProps(1).ref;
    rerender({});
    expect(result.current.getItemProps(1).ref).toBe(ref);
  });
});
