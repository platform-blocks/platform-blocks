import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export type LayoutState = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
};

export const useKnobGeometry = (size: number) => {
  const [layoutState, setLayoutState] = useState<LayoutState>(() => ({
    width: size,
    height: size,
    cx: size / 2,
    cy: size / 2,
    radius: size / 2,
  }));

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const nextWidth = width || size;
      const nextHeight = height || size;
      const diameter = Math.min(nextWidth, nextHeight);
      const containerRadius = diameter / 2;
      setLayoutState({
        width: nextWidth,
        height: nextHeight,
        cx: nextWidth / 2,
        cy: nextHeight / 2,
        radius: containerRadius,
      });
    },
    [size]
  );

  return { layoutState, handleLayout };
};
