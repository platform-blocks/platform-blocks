import { useState } from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { useListNavigation, type UseListNavigationOptions } from '../useListNavigation';
import { keyEvent } from './keyEvent';

type Props = Partial<UseListNavigationOptions>;

const setup = (initial: Props = {}) => {
  const onSelect = jest.fn();
  const onOpen = jest.fn();
  const onClose = jest.fn();
  const hook = renderHook(
    ({ activeIndex: initialIndex, ...props }: Props) => {
      const [activeIndex, setActiveIndex] = useState(initialIndex ?? -1);
      const nav = useListNavigation({
        count: 5,
        activeIndex,
        onActiveChange: setActiveIndex,
        onSelect,
        onOpen,
        onClose,
        getId: (i) => `opt-${i}`,
        listId: 'list',
        ...props,
      });
      return { nav, activeIndex };
    },
    { initialProps: initial }
  );
  const press = (key: string, extra = {}) => {
    const event = keyEvent(key, extra);
    act(() => {
      hook.result.current.nav.inputProps.onKeyDown(event);
    });
    return event;
  };
  return { ...hook, press, onSelect, onOpen, onClose };
};

describe('useListNavigation', () => {
  it('highlights the first option on ArrowDown and moves on', () => {
    const { result, press } = setup();
    press('ArrowDown');
    expect(result.current.activeIndex).toBe(0);
    press('ArrowDown');
    expect(result.current.activeIndex).toBe(1);
    press('ArrowUp');
    expect(result.current.activeIndex).toBe(0);
  });

  it('wraps by default, and not when loop is off', () => {
    const looping = setup({ activeIndex: 4 });
    looping.press('ArrowDown');
    expect(looping.result.current.activeIndex).toBe(0);

    const clamped = setup({ activeIndex: 4, loop: false });
    clamped.press('ArrowDown');
    expect(clamped.result.current.activeIndex).toBe(4);
  });

  it('skips disabled options', () => {
    const { result, press } = setup({ activeIndex: 0, isDisabled: (i) => i === 1 || i === 2 });
    press('ArrowDown');
    expect(result.current.activeIndex).toBe(3);
    expect(result.current.nav.getOptionProps(1)['aria-disabled']).toBe(true);
  });

  it('opens a closed list from the arrows', () => {
    const { result, press, onOpen } = setup({ opened: false });
    press('ArrowDown');
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(result.current.activeIndex).toBe(0);
    press('ArrowUp', { altKey: true });
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('selects with Enter and closes with Escape', () => {
    const { press, onSelect, onClose } = setup({ activeIndex: 2 });
    const enter = press('Enter');
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(enter.preventDefault).toHaveBeenCalled();
    press('Escape');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not consume Enter without a highlighted option', () => {
    const { press, onSelect } = setup();
    expect(press('Enter').preventDefault).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('leaves Home/End to the text caret unless enabled', () => {
    const editable = setup({ activeIndex: 2 });
    expect(editable.press('End').preventDefault).not.toHaveBeenCalled();
    expect(editable.result.current.activeIndex).toBe(2);

    const picker = setup({ activeIndex: 2, homeEndKeys: true });
    picker.press('End');
    expect(picker.result.current.activeIndex).toBe(4);
    picker.press('Home');
    expect(picker.result.current.activeIndex).toBe(0);
  });

  it('pages by pageSize', () => {
    const { result, press } = setup({ count: 30, activeIndex: 0, pageSize: 10 } as Props);
    press('PageDown');
    expect(result.current.activeIndex).toBe(10);
    press('PageUp');
    expect(result.current.activeIndex).toBe(0);
  });

  it('describes the combobox, listbox and options', () => {
    const { result } = setup({ activeIndex: 1 });
    const { nav } = result.current;
    expect(nav.activeId).toBe('opt-1');
    expect(nav.inputProps.role).toBe('combobox');
    expect(nav.inputProps['aria-expanded']).toBe(true);
    expect(nav.getOptionProps(1)).toMatchObject({ id: 'opt-1', role: 'option', 'aria-selected': true });
    expect(nav.getOptionProps(0)['aria-selected']).toBe(false);
  });
});
