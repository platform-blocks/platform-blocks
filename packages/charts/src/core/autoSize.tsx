import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, View, ViewStyle } from 'react-native';
import { isWeb } from '../utils/platform';

/**
 * Size props every chart accepts.
 *
 * `width` omitted means "as wide as the box you were put in" — the chart measures
 * its own slot and redraws when that changes. A number is honoured, but still
 * clamped to the slot: a chart drawn wider than its container is never what the
 * caller wanted, and used to be the single most common way charts broke on a
 * phone.
 */
export interface ChartAutoSizeProps {
  /** Explicit width in px. Omit to fill the available width. */
  width?: number;
  /** Explicit height in px. Defaults to the chart's own resting height. */
  height?: number;
  /**
   * Height as a fraction of the resolved width (`width / height`), applied when
   * `height` is omitted. `2` draws a box twice as wide as it is tall.
   */
  aspectRatio?: number;
  /** Upper bound on the resolved width — useful for radial charts in wide columns. */
  maxWidth?: number;
  /** Lower bound on the resolved width. The chart may then overflow a narrower box. */
  minWidth?: number;
  /** Bounds applied to a height derived from `aspectRatio`. */
  maxHeight?: number;
  minHeight?: number;
}

export interface ChartAutoSizeDefaults {
  /** Width drawn before the box has been measured (SSR, native's first frame). */
  width: number;
  /** Height drawn when neither `height` nor `aspectRatio` is given. */
  height: number;
}

export interface ResolvedChartSize {
  width: number;
  height: number;
  /** True once the container has reported a usable width. */
  measured: boolean;
}

const clamp = (value: number, min?: number, max?: number) => {
  let next = value;
  if (typeof min === 'number') next = Math.max(next, min);
  if (typeof max === 'number') next = Math.min(next, max);
  return next;
};

/** Reads a layout width off a ref, on whichever platform we're on, or `null`. */
const measureNode = (node: any): number | null => {
  if (!node) return null;
  if (isWeb()) {
    const el = typeof node.getBoundingClientRect === 'function' ? node : node?.getNode?.();
    if (el && typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 ? rect.width : null;
    }
  }
  return null;
};

/**
 * Resolves a chart's drawing box from its props and the space it was given.
 *
 * Returns the numbers the chart draws with plus the props for the element that
 * gets measured. Attach `containerProps` to the outermost view the chart
 * renders; everything inside it can then treat width and height as known.
 */
export function useChartAutoSize(
  props: ChartAutoSizeProps,
  defaults: ChartAutoSizeDefaults,
): ResolvedChartSize & {
  containerProps: { ref: React.RefObject<View | null>; onLayout: (e: LayoutChangeEvent) => void; style: ViewStyle };
} {
  const { width, height, aspectRatio, maxWidth, minWidth, maxHeight, minHeight } = props;
  const ref = useRef<View | null>(null);
  const [available, setAvailable] = useState(0);
  const availableRef = useRef(0);
  availableRef.current = available;

  const apply = useCallback((next: number | null) => {
    if (next == null || !Number.isFinite(next) || next <= 0) return;
    // Sub-pixel churn from a resizing window would otherwise re-render the whole
    // chart on every frame of the drag.
    if (Math.abs(availableRef.current - next) < 1) return;
    setAvailable(next);
  }, []);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => apply(event.nativeEvent.layout.width),
    [apply],
  );

  // Web measures before paint, so a chart that lands in a 1100px column is
  // never seen at its 400px fallback. Native has no synchronous equivalent and
  // corrects on the first `onLayout` instead.
  useLayoutEffect(() => {
    if (!isWeb()) return;
    apply(measureNode(ref.current));
  }, [apply]);

  return useMemo(() => {
    const measured = available > 0;
    // The container is capped at 100% of its parent, so a measured width already
    // accounts for an explicit `width` that the parent could not honour.
    const base = measured ? available : width ?? defaults.width;
    const resolvedWidth = Math.round(clamp(base, minWidth, maxWidth));

    let resolvedHeight: number;
    if (typeof height === 'number') {
      resolvedHeight = height;
    } else if (typeof aspectRatio === 'number' && aspectRatio > 0) {
      resolvedHeight = clamp(resolvedWidth / aspectRatio, minHeight, maxHeight);
    } else {
      resolvedHeight = clamp(defaults.height, minHeight, maxHeight);
    }

    return {
      width: resolvedWidth,
      height: Math.round(resolvedHeight),
      measured,
      containerProps: {
        ref,
        onLayout,
        style: {
          // A fixed width still yields to the box it is in; `maxWidth: '100%'` is
          // what turns an oversized chart into a fitting one rather than a
          // clipped one. Alignment is deliberately left to the parent, so a
          // capped chart centres or not according to the layout it sits in.
          width: typeof width === 'number' ? width : '100%',
          // A pinned width has to stay capped at the parent or it clips again;
          // an unpinned one is already 100%, so the cap can carry `maxWidth` and
          // let the surrounding layout align the narrower box.
          maxWidth: typeof width === 'number' ? '100%' : (typeof maxWidth === 'number' ? maxWidth : '100%'),
        } as ViewStyle,
      },
    };
  }, [available, width, height, aspectRatio, maxWidth, minWidth, maxHeight, minHeight, defaults.width, defaults.height, onLayout]);
}

/**
 * Wraps a chart so it fills the space it is given.
 *
 * The chart itself keeps taking plain numbers — every layout calculation inside
 * it is unchanged — while the wrapper owns the one thing it cannot know on its
 * own: how much room it actually has. Applied at each chart's export, so
 * `import { BarChart }` is responsive and the underlying component stays
 * directly usable with explicit numbers in tests.
 */
export function withChartAutoSize<P extends ChartAutoSizeProps>(
  Chart: React.ComponentType<P>,
  defaults: ChartAutoSizeDefaults,
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => {
    const { aspectRatio, maxWidth, minWidth, maxHeight, minHeight, ...rest } = props;
    const { width, height, containerProps } = useChartAutoSize(props, defaults);

    return (
      <View {...containerProps}>
        <Chart {...(rest as P)} width={width} height={height} />
      </View>
    );
  };

  const name = Chart.displayName || Chart.name || 'Chart';
  Wrapped.displayName = name;
  return Wrapped;
}
