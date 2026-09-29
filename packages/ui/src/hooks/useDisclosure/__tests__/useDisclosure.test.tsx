import { renderHook, act } from '@testing-library/react-native';
import { useDisclosure } from '../useDisclosure';

describe('useDisclosure', () => {
  it('initializes closed by default', () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current[0]).toBe(false);
  });

  it('honors the initial state argument', () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current[0]).toBe(true);
  });

  it('opens, closes, and toggles', () => {
    const { result } = renderHook(() => useDisclosure(false));

    act(() => result.current[1].open());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1].close());
    expect(result.current[0]).toBe(false);

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(true);
    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(false);
  });

  it('fires onOpen / onClose only on real transitions', () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const { result } = renderHook(() => useDisclosure(false, { onOpen, onClose }));

    act(() => result.current[1].close()); // already closed — no-op
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current[1].open());
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => result.current[1].open()); // already open — no-op
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => result.current[1].close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('toggle fires the correct callback', () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const { result } = renderHook(() => useDisclosure(false, { onOpen, onClose }));

    act(() => result.current[1].toggle());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current[1].toggle());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the handlers stable and calls the latest inline callbacks', () => {
    const calls: string[] = [];
    const { result, rerender } = renderHook(
      ({ tag }: { tag: string }) =>
        useDisclosure(false, { onOpen: () => calls.push(`${tag}:open`), onClose: () => calls.push(`${tag}:close`) }),
      { initialProps: { tag: 'v1' } },
    );
    const handlers = result.current[1];

    rerender({ tag: 'v2' });
    expect(result.current[1]).toBe(handlers);

    act(() => handlers.open());
    act(() => handlers.toggle());
    expect(calls).toEqual(['v2:open', 'v2:close']);
  });

  it('sees its own pending state when called twice in one event', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useDisclosure(false, { onOpen }));

    act(() => {
      result.current[1].open();
      result.current[1].open();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe(true);
  });
});
