import type { LayoutChangeEvent } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import { useElementSize } from '../useElementSize';

const layout = (width: number, height: number) =>
  ({ nativeEvent: { layout: { x: 0, y: 0, width, height } } }) as LayoutChangeEvent;

describe('useElementSize', () => {
  it('starts unmeasured at 0 × 0', () => {
    const { result } = renderHook(() => useElementSize());
    expect(result.current).toMatchObject({ width: 0, height: 0, measured: false });
  });

  it('reports the size from onLayout', () => {
    const { result } = renderHook(() => useElementSize());
    act(() => result.current.onLayout(layout(320, 180)));
    expect(result.current).toMatchObject({ width: 320, height: 180, measured: true });

    act(() => result.current.onLayout(layout(400, 180)));
    expect(result.current.width).toBe(400);
  });

  it('counts a genuine 0 × 0 layout as measured', () => {
    const { result } = renderHook(() => useElementSize());
    act(() => result.current.onLayout(layout(0, 0)));
    expect(result.current.measured).toBe(true);
  });

  it('keeps the same object when the size is unchanged', () => {
    const { result } = renderHook(() => useElementSize());
    act(() => result.current.onLayout(layout(100, 50)));
    const measured = result.current;

    act(() => result.current.onLayout(layout(100, 50)));
    expect(result.current).toBe(measured);
  });

  it('keeps onLayout stable', () => {
    const { result } = renderHook(() => useElementSize());
    const { onLayout } = result.current;
    act(() => result.current.onLayout(layout(10, 10)));
    expect(result.current.onLayout).toBe(onLayout);
  });
});
