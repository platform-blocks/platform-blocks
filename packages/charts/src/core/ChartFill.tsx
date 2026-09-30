import React, { useRef } from 'react';
import { LinearGradient, RadialGradient, Stop } from 'react-native-svg';

export interface ChartGradientStop {
  /** Position along the gradient, 0-1 */
  offset: number;
  color: string;
  opacity?: number;
}

/**
 * A gradient paint for any filled mark (bars, slices, gauge ranges).
 *
 * Linear gradients run along `angle` unless `from`/`to` are given. Radial
 * gradients read `from` as the center and `to` as the x/y radius. All points
 * are 0-1 fractions of the box the gradient spans.
 */
export interface ChartGradient {
  /** Gradient type (defaults to linear) */
  type?: 'linear' | 'radial';
  /** Linear direction in degrees: 0 = left → right, 90 = top → bottom, 270 = bottom → top. Defaults to 90. */
  angle?: number;
  /** Start point (linear) or center (radial); overrides `angle` */
  from?: { x: number; y: number };
  /** End point (linear) or radius (radial); overrides `angle` */
  to?: { x: number; y: number };
  /** Gradient stops */
  stops: ChartGradientStop[];
  /**
   * What box the gradient spans.
   * - `'mark'` (default): every mark shows the whole gradient.
   * - `'plot'`: one gradient across the plot area; each mark shows the slice under
   *   it, so a short bar only reaches the low end of a vertical gradient.
   */
  extent?: 'mark' | 'plot';
}

/** A solid color or a gradient. */
export type ChartFill = string | ChartGradient;

export function isChartGradient(fill: unknown): fill is ChartGradient {
  return !!fill && typeof fill === 'object' && Array.isArray((fill as ChartGradient).stops);
}

/**
 * A single color that stands in for a fill where only a solid color fits —
 * legend swatches, tooltip dots. For a gradient, the most opaque stop.
 */
export function fillSwatchColor(fill: ChartFill | undefined, fallback: string): string {
  if (!fill) return fallback;
  if (typeof fill === 'string') return fill;
  let best: ChartGradientStop | undefined;
  for (const stop of fill.stops) {
    if (!best || (stop.opacity ?? 1) > (best.opacity ?? 1)) best = stop;
  }
  return best?.color ?? fallback;
}

/** Linear gradient endpoints as 0-1 fractions for an angle in degrees. */
export function angleToGradientPoints(angle: number = 0) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  return {
    x1: 0.5 - x / 2,
    y1: 0.5 - y / 2,
    x2: 0.5 + x / 2,
    y2: 0.5 + y / 2,
  };
}

/**
 * A stable, document-unique id for gradient defs. SVG ids are global to the page,
 * so two charts sharing an id would both paint the first chart's gradient.
 */
export function useChartFillId(prefix: string): string {
  const ref = useRef('');
  if (!ref.current) ref.current = `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  return ref.current;
}

export interface ChartGradientDefProps {
  id: string;
  gradient: ChartGradient;
  /**
   * The box to span in the referencing element's user space. When given, the
   * gradient is laid out with `userSpaceOnUse` across it (the `'plot'` extent);
   * otherwise each mark's own bounding box is used.
   */
  bounds?: { x: number; y: number; width: number; height: number };
}

/** Render inside `<Defs>`; reference with `fill={\`url(#${id})\`}`. */
export const ChartGradientDef: React.FC<ChartGradientDefProps> = ({ id, gradient, bounds }) => {
  const toX = (v: number) => (bounds ? bounds.x + v * bounds.width : v);
  const toY = (v: number) => (bounds ? bounds.y + v * bounds.height : v);
  const units = bounds ? 'userSpaceOnUse' : 'objectBoundingBox';
  const stops = gradient.stops.map((stop, index) => (
    <Stop
      key={`${id}-stop-${index}`}
      offset={stop.offset}
      stopColor={stop.color}
      stopOpacity={stop.opacity ?? 1}
    />
  ));

  if (gradient.type === 'radial') {
    const cx = gradient.from?.x ?? 0.5;
    const cy = gradient.from?.y ?? 0.5;
    const rx = gradient.to?.x ?? 0.5;
    const ry = gradient.to?.y ?? 0.5;
    return (
      <RadialGradient
        id={id}
        gradientUnits={units}
        cx={toX(cx).toString()}
        cy={toY(cy).toString()}
        rx={(bounds ? rx * bounds.width : rx).toString()}
        ry={(bounds ? ry * bounds.height : ry).toString()}
      >
        {stops}
      </RadialGradient>
    );
  }

  const points = gradient.from || gradient.to
    ? {
        x1: gradient.from?.x ?? 0,
        y1: gradient.from?.y ?? 0,
        x2: gradient.to?.x ?? 1,
        y2: gradient.to?.y ?? 1,
      }
    : angleToGradientPoints(gradient.angle ?? 90);
  return (
    <LinearGradient
      id={id}
      gradientUnits={units}
      x1={toX(points.x1).toString()}
      y1={toY(points.y1).toString()}
      x2={toX(points.x2).toString()}
      y2={toY(points.y2).toString()}
    >
      {stops}
    </LinearGradient>
  );
};
