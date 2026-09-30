// ChartActiveTooltip — the single tooltip for all charts (hit-test interaction engine).
// Reads the normalized `activeTarget`/`activeSlice` from the store and renders a themed
// box at its canonical pixel anchor (portal to document.body on web using page coords;
// absolute-positioned on native).

import React from 'react';
import { View, Text, Animated } from 'react-native';
import { platformShadow } from '../utils/platformShadow';
import { useChartTheme } from '../theme/ChartThemeContext';
import { useOptionalChartInteraction, useChartInteractionVolatile } from './ChartInteractionContext';
import type { ActiveTarget } from '../core/hittest/types';

export interface ChartActiveTooltipProps {
  /** Custom renderer for the whole tooltip body (single or multi). Overrides the default. */
  render?: (target: ActiveTarget, rows: ActiveTarget[]) => React.ReactNode;
  /** Custom renderer for one row; falls back to the default row when it returns undefined. */
  renderEntry?: (target: ActiveTarget, defaultNode: React.ReactNode) => React.ReactNode;
  /** Optional header rendered above the rows (e.g. the shared x-value / timestamp). */
  renderHeader?: (rows: ActiveTarget[]) => React.ReactNode;
  /** Filter rows out of a multi-series slice (return false to exclude). */
  filterEntry?: (target: ActiveTarget, index: number, all: ActiveTarget[]) => boolean;
  /** Sort rows; defaults to nearest-first (by pixel distance). */
  sortEntries?: (a: ActiveTarget, b: ActiveTarget) => number;
  /** Max rows shown in a multi-series slice. Defaults to config.aggregatorMaxSeries ?? 8. */
  maxEntries?: number;
  style?: any;
  offset?: { x: number; y: number };
}

export const ChartActiveTooltip: React.FC<ChartActiveTooltipProps> = ({
  render,
  renderEntry,
  renderHeader,
  filterEntry,
  sortEntries,
  maxEntries,
  style,
  offset = { x: 14, y: 14 },
}) => {
  const theme = useChartTheme();
  const store = useOptionalChartInteraction();
  // The tooltip is the primary volatile subscriber — it re-renders each frame to follow.
  const { activeTarget, activeSlice, pointer } = useChartInteractionVolatile();
  const rootOffset = store?.rootOffset ?? null;
  const liveTooltip = store?.config?.liveTooltip ?? true;
  const multiTooltip = !!store?.config?.multiTooltip;
  const resolvedMaxEntries = maxEntries ?? store?.config?.aggregatorMaxSeries ?? 8;

  const [reactDom, setReactDom] = React.useState<typeof import('react-dom') | null>(null);
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    let cancelled = false;
    import('react-dom').then((m) => { if (!cancelled) setReactDom(m); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const animX = React.useRef(new Animated.Value(0)).current;
  const animY = React.useRef(new Animated.Value(0)).current;

  const usePortal = !!(typeof document !== 'undefined' && reactDom && (store?.config?.popoverPortal ?? true));

  const anchor = activeTarget?.pixel;
  let rawLeft = 0;
  let rawTop = 0;
  if (anchor) {
    if (usePortal) {
      // Portal renders into document.body with position: fixed. Position from the
      // pointer's page coordinates (always correct on web) rather than depending on
      // a separately-measured container offset. Fall back to anchor + rootOffset.
      if (pointer?.pageX != null && pointer?.pageY != null) {
        rawLeft = pointer.pageX + offset.x;
        rawTop = pointer.pageY + offset.y;
      } else {
        rawLeft = anchor.x + (rootOffset?.left ?? 0) + offset.x;
        rawTop = anchor.y + (rootOffset?.top ?? 0) + offset.y;
      }
    } else {
      rawLeft = anchor.x + offset.x;
      rawTop = anchor.y + offset.y;
    }
    if (typeof window !== 'undefined') {
      rawLeft = Math.min(Math.max(0, rawLeft), (window.innerWidth || rawLeft) - 250);
      rawTop = Math.min(Math.max(0, rawTop), (window.innerHeight || rawTop) - 110);
    }
  }

  // Position handling:
  //  - Following the live cursor (pointer page coords): SNAP each frame. The cursor already
  //    moves smoothly, so animating toward it just makes the box trail ~100ms behind — the
  //    "laggy tooltip". setValue tracks it 1:1 and costs nothing on the JS thread.
  //  - Discrete/anchor-snapped (keyboard nav, native without page coords): a short ease
  //    smooths the jump between points.
  const followsPointer = usePortal && pointer?.pageX != null && pointer?.pageY != null;
  const wasVisible = React.useRef(false);
  React.useEffect(() => {
    if (!anchor) {
      wasVisible.current = false;
      return;
    }
    if (!wasVisible.current || followsPointer) {
      animX.setValue(rawLeft);
      animY.setValue(rawTop);
      wasVisible.current = true;
      return;
    }
    Animated.timing(animX, { toValue: rawLeft, duration: 100, useNativeDriver: false }).start();
    Animated.timing(animY, { toValue: rawTop, duration: 100, useNativeDriver: false }).start();
  }, [anchor, rawLeft, rawTop, animX, animY, followsPointer]);

  if (!liveTooltip || !activeTarget) return null;

  // Value shown for a row: chart-precomputed formattedValue wins, then the datum's
  // own hints, then the raw value. Chart marks can provide formattedValue or
  // customTooltip so the tooltip need not derive display text per chart type.
  const entryText = (t: ActiveTarget): React.ReactNode =>
    t.formattedValue ??
    (t.datum as any)?.formattedValue ??
    (t.datum as any)?.label ??
    (typeof t.value === 'number' ? t.value : String(t.value));
  const entryColor = (t: ActiveTarget) => t.color ?? theme.colors.accentPalette?.[0] ?? theme.colors.textPrimary;

  const showMulti = multiTooltip && activeSlice.length > 0;
  let rows: ActiveTarget[] = showMulti ? [...activeSlice] : [activeTarget];
  if (showMulti) {
    if (filterEntry) rows = rows.filter((t, i, all) => filterEntry(t, i, all));
    rows.sort(sortEntries ?? ((a, b) => a.distance - b.distance));
    if (rows.length > resolvedMaxEntries) rows = rows.slice(0, resolvedMaxEntries);
  }

  const defaultRow = (t: ActiveTarget, i: number) => {
    const label = t.label ?? String(t.seriesId);
    return (
      <View key={`${t.seriesId}-${t.markId}-${i}`} style={{ marginTop: i === 0 ? 0 : 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entryColor(t), marginRight: 6 }} />
          {/* A custom tooltip body replaces the "label: value" line; otherwise render it. */}
          {t.customTooltip != null ? (
            <Text style={{ fontSize: 12, color: theme.colors.textPrimary }}>{label}</Text>
          ) : (
            <Text style={{ fontSize: 12, color: theme.colors.textPrimary }}>{label}: {entryText(t)}</Text>
          )}
        </View>
        {t.customTooltip != null && (
          <View style={{ marginTop: 2 }}>
            {typeof t.customTooltip === 'string' || typeof t.customTooltip === 'number' ? (
              <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>{t.customTooltip}</Text>
            ) : (
              t.customTooltip
            )}
          </View>
        )}
      </View>
    );
  };

  const body = (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: usePortal ? ('fixed' as any) : 'absolute',
          left: animX,
          top: animY,
          backgroundColor: theme.colors.background,
          padding: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: theme.colors.grid,
          maxWidth: 240,
          zIndex: 9999,
          ...platformShadow({ color: '#000', opacity: 0.25, offsetY: 2, radius: 4, elevation: 5 }),
        },
        style,
      ]}
    >
      {render ? (
        render(activeTarget, rows)
      ) : (
        <>
          {renderHeader?.(rows)}
          {rows.map((t, i) => {
            const node = defaultRow(t, i);
            return (
              <React.Fragment key={`${t.seriesId}-${t.markId}-${i}`}>
                {renderEntry ? renderEntry(t, node) : node}
              </React.Fragment>
            );
          })}
        </>
      )}
    </Animated.View>
  );

  if (usePortal && reactDom?.createPortal) {
    return reactDom.createPortal(body, document.body);
  }
  return body;
};

ChartActiveTooltip.displayName = 'ChartActiveTooltip';
