import { act, renderHook } from '@testing-library/react-native';
import { useSplitter } from '../useSplitter';

it('resizes adjacent panes and preserves declared fixed units', () => {
  const { result } = renderHook(() =>
    useSplitter({ panels: [{ defaultSize: '100px', min: '50px' }, { defaultSize: 50 }] }),
  );
  act(() => result.current.onLayout({ nativeEvent: { layout: { width: 400, height: 200 } } }));
  act(() => result.current.resize(0, 20));
  expect(result.current.sizes[0]).toBe('120px');
  expect(result.current.sizes[1]).toBe(70);
});

it('collapses and expands a flexible pane', () => {
  const { result } = renderHook(() =>
    useSplitter({ panels: [{ defaultSize: 30, collapsible: true }, { defaultSize: 70 }] }),
  );
  act(() => result.current.onLayout({ nativeEvent: { layout: { width: 400, height: 200 } } }));
  act(() => result.current.collapse(0));
  expect(result.current.sizes).toEqual([0, 100]);
  act(() => result.current.expand(0));
  expect(result.current.sizes).toEqual([30, 70]);
});

it('borrows from a farther pane when the adjacent pane reaches its minimum', () => {
  const { result } = renderHook(() =>
    useSplitter({
      panels: [
        { defaultSize: 25 },
        { defaultSize: 25, min: 20 },
        { defaultSize: 25 },
        { defaultSize: 25 },
      ],
      redistribute: 'nearest',
    }),
  );
  act(() => result.current.onLayout({ nativeEvent: { layout: { width: 400, height: 200 } } }));
  act(() => result.current.resize(0, 60));
  expect(result.current.sizes).toEqual([40, 20, 15, 25]);
});
