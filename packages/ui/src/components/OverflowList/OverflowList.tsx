import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { factory } from '../../core/factory';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { OverflowListProps } from './types';

export function fit(widths: number[], available: number, overflowWidth: number, gap: number, maxRows: number, maxVisible: number, collapseFrom: 'start' | 'end') {
  const max = Math.min(widths.length, maxVisible);
  for (let count = max; count >= 0; count--) {
    const shown = collapseFrom === 'end' ? widths.slice(0, count) : widths.slice(widths.length - count);
    const parts = count === widths.length ? shown : collapseFrom === 'end' ? [...shown, overflowWidth] : [overflowWidth, ...shown];
    let rows = 1, used = 0;
    for (const itemWidth of parts) {
      const next = used ? used + gap + itemWidth : itemWidth;
      if (next > available && used) { rows++; used = itemWidth; } else used = next;
      if (itemWidth > available || rows > maxRows) break;
    }
    if (rows <= maxRows && parts.every((w) => w <= available)) return count;
  }
  return 0;
}

const Root = factory<{ props: OverflowListProps<unknown>; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { data, renderItem, renderOverflow, gap = 'sm', maxRows = 1, maxVisibleItems = Infinity, collapseFrom = 'end', getItemKey, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const theme = useTheme();
  const pixelGap = resolveSpacing(theme, gap);
  const spacingGap = typeof pixelGap === 'number' ? pixelGap : 0;
  const [available, setAvailable] = useState(0);
  const [widths, setWidths] = useState<Record<number, number>>({});
  const [overflowWidth, setOverflowWidth] = useState(0);
  const [measuredFor, setMeasuredFor] = useState(data);
  useEffect(() => { if (measuredFor !== data) { setWidths({}); setOverflowWidth(0); setMeasuredFor(data); } }, [data, measuredFor]);
  const ready = measuredFor === data && available > 0 && data.every((_, i) => widths[i] > 0) && (overflowWidth > 0 || data.length === 0);
  const count = useMemo(() => ready ? fit(data.map((_, i) => widths[i]), available, overflowWidth, spacingGap, Math.max(1, maxRows), Math.max(0, maxVisibleItems), collapseFrom) : 0, [ready, data, widths, available, overflowWidth, spacingGap, maxRows, maxVisibleItems, collapseFrom]);
  const hidden = collapseFrom === 'end' ? data.slice(count) : data.slice(0, data.length - count);
  const shown = collapseFrom === 'end' ? data.slice(0, count) : data.slice(data.length - count);
  const originalIndex = (i: number) => collapseFrom === 'end' ? i : data.length - count + i;
  const overflow = hidden.length ? <View key="overflow">{renderOverflow([...hidden])}</View> : null;
  return <View ref={ref} testID={testID} onLayout={(event) => setAvailable(event.nativeEvent.layout.width)} style={[{ width: '100%' }, spacing, style]}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacingGap, opacity: ready ? 1 : 0 }}>
      {collapseFrom === 'start' && overflow}
      {shown.map((item, i) => <View key={getItemKey?.(item, originalIndex(i)) ?? originalIndex(i)}>{renderItem(item, originalIndex(i))}</View>)}
      {collapseFrom === 'end' && overflow}
    </View>
    <View style={[{ position: 'absolute', opacity: 0, flexDirection: 'row', flexWrap: 'wrap', gap: spacingGap }, pointerEventsStyles.none]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      {data.map((item, i) => <View key={getItemKey?.(item, i) ?? i} onLayout={(event) => { const width = event.nativeEvent.layout.width; setWidths((current) => current[i] === width ? current : { ...current, [i]: width }); }}>{renderItem(item, i)}</View>)}
      <View onLayout={(event) => setOverflowWidth(event.nativeEvent.layout.width)}>{renderOverflow(ready ? [...hidden] : [...data])}</View>
    </View>
  </View>;
}, { displayName: 'OverflowList' });
export const OverflowList = Root as <T>(props: OverflowListProps<T> & { ref?: React.Ref<View> }) => React.ReactElement;
