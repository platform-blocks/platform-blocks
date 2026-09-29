// ChartGestureSurface — declarative full-bleed overlay that captures pointer
// input for a chart via useChartPointer. Charts nest this over their plot (or
// use the useChartPointer hook directly to spread handlers onto an existing SVG
// overlay). One surface replaces every per-chart onMouseMove / PanResponder /
// isWeb branch.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useChartPointer, UseChartPointerOptions } from './useChartPointer';

export interface ChartGestureSurfaceProps extends Omit<UseChartPointerOptions, 'plotWidth' | 'plotHeight' | 'padding'> {
  padding: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  /** Overlay size — usually the full chart (width/height). Defaults to filling parent. */
  w?: number;
  h?: number;
  style?: any;
  children?: React.ReactNode;
}

export const ChartGestureSurface: React.FC<ChartGestureSurfaceProps> = (props) => {
  const { w: width, h: height, style, children, ...pointerOpts } = props;
  const { handlers, ref, onLayout } = useChartPointer(pointerOpts);

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, width != null && height != null ? { width, height } : null, style]}
      // On web, PointerEvents flow to the DOM node; on native, responder props
      // are wired via `handlers`. `pointerEvents="box-only"` lets the surface
      // receive events without blocking children's own presses when needed.
      {...handlers}
    >
      {children}
    </View>
  );
};

ChartGestureSurface.displayName = 'ChartGestureSurface';
