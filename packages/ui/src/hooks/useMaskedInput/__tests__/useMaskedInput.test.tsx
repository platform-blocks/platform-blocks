import { act, renderHook } from '@testing-library/react-native';

import { useMaskedInput } from '../index';

const PHONE = { mask: '(000) 000-0000' };

describe('useMaskedInput', () => {
  it('formats the initial value and typed input', () => {
    const { result } = renderHook(() => useMaskedInput({ mask: PHONE, initialValue: '555' }));
    expect(result.current.value).toBe('(555');

    act(() => result.current.handleChangeText('5551234'));
    expect(result.current.value).toBe('(555) 123-4');
    expect(result.current.unmaskedValue).toBe('5551234');
    expect(result.current.isComplete).toBe(false);
  });

  it('reports changes to the latest inline callbacks after commit', () => {
    const seen: string[] = [];
    const { result, rerender } = renderHook(
      ({ tag }: { tag: string }) =>
        useMaskedInput({ mask: PHONE, onUnmaskedValueChange: (raw) => seen.push(`${tag}:${raw}`) }),
      { initialProps: { tag: 'v1' } },
    );

    rerender({ tag: 'v2' });
    act(() => result.current.setUnmaskedValue('5551234567'));
    expect(seen).toEqual(['v2:5551234567']);
    expect(result.current.isComplete).toBe(true);
  });

  it('keeps its handlers stable and the result stable while nothing changes', () => {
    const { result, rerender } = renderHook(() => useMaskedInput({ mask: PHONE }));
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);

    act(() => first.handleChangeText('1'));
    expect(result.current.handleChangeText).toBe(first.handleChangeText);
    expect(result.current.value).not.toBe(first.value);
  });
});
