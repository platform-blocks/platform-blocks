import { useCallback, useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeReturn extends ElementSize {
  /** Pass to the measured element's `onLayout`. Stable for the component's lifetime. */
  onLayout: (event: LayoutChangeEvent) => void;
  /** `false` until the first layout event; `width` and `height` are 0 until then. */
  measured: boolean;
}

interface SizeState extends ElementSize {
  measured: boolean;
}

const UNMEASURED: SizeState = { width: 0, height: 0, measured: false };

/**
 * Tracks an element's rendered width and height through `onLayout`, on web and
 * native alike (React Native Web backs `onLayout` with a ResizeObserver). The
 * returned object keeps its identity until the size actually changes.
 *
 * @example
 * const { width, onLayout } = useElementSize();
 * return (
 *   <View onLayout={onLayout}>
 *     {width > 480 ? <WideLayout /> : <NarrowLayout />}
 *   </View>
 * );
 */
export function useElementSize(): UseElementSizeReturn {
  const [size, setSize] = useState<SizeState>(UNMEASURED);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((previous) =>
      previous.measured && previous.width === width && previous.height === height
        ? previous
        : { width, height, measured: true }
    );
  }, []);

  return useMemo(() => ({ ...size, onLayout }), [size, onLayout]);
}
