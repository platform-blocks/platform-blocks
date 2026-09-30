import { act, renderHook } from '@testing-library/react-native';

import { getPaginationRange, usePagination } from '../usePagination';

describe('getPaginationRange', () => {
  it('lists every page when they all fit', () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps a fixed item count as the current page moves', () => {
    const lengths = new Set<number>();
    for (let page = 1; page <= 20; page += 1) lengths.add(getPaginationRange(page, 20).length);
    expect([...lengths]).toEqual([7]);
  });

  it('fills the leading edge near the start', () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
    expect(getPaginationRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
  });

  it('shows both gaps in the middle', () => {
    expect(getPaginationRange(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  it('fills the trailing edge near the end', () => {
    expect(getPaginationRange(7, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    expect(getPaginationRange(10, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
  });

  it('never hides a single page behind an ellipsis', () => {
    for (let page = 1; page <= 30; page += 1) {
      const range = getPaginationRange(page, 30, 1, 1);
      range.forEach((item, index) => {
        if (item !== 'ellipsis') return;
        const before = range[index - 1] as number;
        const after = range[index + 1] as number;
        expect(after - before).toBeGreaterThan(2);
      });
    }
  });

  it('honors siblings and boundaries, including zero boundaries', () => {
    expect(getPaginationRange(10, 20, 2, 2)).toEqual([1, 2, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 19, 20]);
    expect(getPaginationRange(5, 10, 1, 0)).toEqual(['ellipsis', 4, 5, 6, 'ellipsis']);
    expect(getPaginationRange(1, 10, 1, 0)).toEqual([1, 2, 3, 4, 'ellipsis']);
    expect(getPaginationRange(10, 10, 1, 0)).toEqual(['ellipsis', 7, 8, 9, 10]);
  });

  it('handles empty and out-of-range input', () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
    expect(getPaginationRange(99, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    expect(getPaginationRange(-3, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
  });
});

describe('usePagination', () => {
  it('starts on defaultValue (or 1) and moves between pages', () => {
    const { result } = renderHook(() => usePagination({ total: 10, defaultValue: 3 }));
    expect(result.current.page).toBe(3);

    act(() => result.current.next());
    expect(result.current.page).toBe(4);
    act(() => result.current.previous());
    expect(result.current.page).toBe(3);
    act(() => result.current.last());
    expect(result.current.page).toBe(10);
    act(() => result.current.first());
    expect(result.current.page).toBe(1);
    act(() => result.current.setPage(7));
    expect(result.current.page).toBe(7);
    expect(result.current.range).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
  });

  it('clamps to 1…total and skips no-op changes', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => usePagination({ total: 5, onChange }));

    act(() => result.current.previous());
    act(() => result.current.first());
    act(() => result.current.setPage(Number.NaN));
    expect(onChange).not.toHaveBeenCalled();

    act(() => result.current.setPage(99));
    expect(result.current.page).toBe(5);
    expect(onChange).toHaveBeenLastCalledWith(5);

    act(() => result.current.next());
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('composes several moves in one event', () => {
    const { result } = renderHook(() => usePagination({ total: 10 }));
    act(() => {
      result.current.next();
      result.current.next();
    });
    expect(result.current.page).toBe(3);
  });

  it('is controlled by value + onChange', () => {
    const onChange = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => usePagination({ total: 10, value, onChange }),
      { initialProps: { value: 2 } }
    );

    act(() => result.current.next());
    expect(onChange).toHaveBeenCalledWith(3);
    expect(result.current.page).toBe(2);

    rerender({ value: 3 });
    expect(result.current.page).toBe(3);
  });

  it('clamps the current page when total shrinks', () => {
    const { result, rerender } = renderHook(
      ({ total }: { total: number }) => usePagination({ total, defaultValue: 8 }),
      { initialProps: { total: 10 } }
    );
    rerender({ total: 4 });
    expect(result.current.page).toBe(4);
  });

  it('keeps its handlers stable across page changes', () => {
    const { result } = renderHook(() => usePagination({ total: 10 }));
    const { next, setPage } = result.current;
    act(() => result.current.next());
    expect(result.current.next).toBe(next);
    expect(result.current.setPage).toBe(setPage);
  });
});
