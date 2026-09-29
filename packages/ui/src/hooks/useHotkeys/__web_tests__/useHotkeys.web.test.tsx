import { fireEvent, renderHook } from '@testing-library/react';

import { useHotkeys } from '../index';

describe('useHotkeys (web)', () => {
  it('always calls the latest handler without re-subscribing', () => {
    const add = jest.spyOn(document, 'addEventListener');
    const first = jest.fn();
    const second = jest.fn();

    const { rerender } = renderHook(({ handler }: { handler: () => void }) => useHotkeys([['mod+k', handler], ['escape', handler]]), {
      initialProps: { handler: first },
    });
    const keydownSubscriptions = () => add.mock.calls.filter(([type]) => type === 'keydown').length;
    expect(keydownSubscriptions()).toBe(1);

    rerender({ handler: second });
    expect(keydownSubscriptions()).toBe(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    add.mockRestore();
  });

  it('ignores typing in inputs except Escape', () => {
    const handler = jest.fn();
    renderHook(() => useHotkeys([['k', handler], ['escape', handler]]));
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
    input.remove();
  });
});
