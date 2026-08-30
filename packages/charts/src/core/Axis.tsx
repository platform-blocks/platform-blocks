import React, { useMemo } from 'react';
import { View, Text, TextStyle } from 'react-native';
import { Scale } from '../utils/scales';
import { useChartTheme } from '../theme/ChartThemeContext';
import { estimateChartTextWidth } from '../ChartBase';
import { AXIS_TICK_PADDING, AXIS_TICK_SIZE, AXIS_TITLE_GAP } from './axisLayout';

export interface AxisProps {
  scale: Scale<any>;
  orientation: 'left' | 'right' | 'top' | 'bottom';
  length: number; // pixel length of the axis line
  offset?: { x?: number; y?: number };
  tickCount?: number;
  /**
   * Exact tick values to draw. Pass the same array the chart's gridlines use —
   * otherwise the axis re-derives its own from the scale and the two disagree,
   * which is how a chart ended up with gridlines at 0/20/40 and a lone "0" label.
   */
  ticks?: (number | string)[];
  tickSize?: number;
  tickPadding?: number;
  tickFormat?: (value: any) => string;
  label?: string;
  labelOffset?: number;
  stroke?: string;
  strokeWidth?: number;
  showLine?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  avoidLabelOverlap?: boolean; // try to hide some labels if overlapping
  rotateLabels?: boolean; // rotate (45deg) if horizontal overlap
  style?: any;
  tickLabelColor?: string;
  tickLabelFontSize?: number;
  tickLabelStyle?: TextStyle;
  /** Width of the (centered) tick-label box. Defaults to the space the chart's
   *  padding reserved for it; pass the value `resolveCartesianPadding` returned. */
  tickLabelWidth?: number;
  /** Lines a tick label may wrap onto before it is truncated. Vertical axes take 1. */
  tickLabelLines?: number;
  labelColor?: string;
  labelFontSize?: number;
  labelStyle?: TextStyle;
  /** Width of the axis-title box. Defaults to the title's own measured width, so
   *  a long title stays on one line instead of stacking. */
  labelWidth?: number;
}

// Simple axis renderer (View-based). For high performance / crisp lines use SVG later.
export const Axis: React.FC<AxisProps> = ({
  scale,
  orientation,
  length,
  offset = {},
  tickCount = 5,
  ticks: tickValues,
  tickSize = AXIS_TICK_SIZE,
  tickPadding = AXIS_TICK_PADDING,
  tickFormat,
  label,
  labelOffset,
  stroke = '#ccc',
  strokeWidth = 1,
  showLine = true,
  showTicks = true,
  showLabels = true,
  avoidLabelOverlap = true,
  style,
  tickLabelColor,
  tickLabelFontSize,
  tickLabelStyle,
  tickLabelWidth,
  tickLabelLines,
  labelColor,
  labelFontSize,
  labelStyle,
  labelWidth,
}) => {
  const theme = useChartTheme();
  const isHorizontal = orientation === 'top' || orientation === 'bottom';
  const domain = scale.domain();
  let rawTicks: any[] = [];
  if (tickValues) rawTicks = tickValues;
  else if (scale.ticks) rawTicks = scale.ticks(tickCount);
  else if (Array.isArray(domain)) rawTicks = domain;

  const resolvedTickFontSize = tickLabelFontSize ?? 11;

  /**
   * Drops labels that would sit on top of their neighbour.
   *
   * Both axes need this, not just the horizontal one: a heatmap row 5px tall
   * stacks its day names into an unreadable smear exactly the way a crowded
   * date axis does. Horizontal labels collide by width, vertical ones by line
   * height, and in both cases the first label of a colliding pair wins.
   */
  const processedTicks = useMemo(() => {
    if (!showLabels || !avoidLabelOverlap) return rawTicks.map(t => ({ value: t, hidden: false }));
    const horizontal = orientation === 'bottom' || orientation === 'top';
    const extent = (val: any) => horizontal
      ? estimateChartTextWidth(String(tickFormat ? tickFormat(val) : val), resolvedTickFontSize)
      : resolvedTickFontSize * 1.3;
    const placed: { start: number; end: number }[] = [];
    return rawTicks.map(t => {
      const pos = scale(t);
      const size = extent(t);
      const start = pos - size / 2;
      const end = pos + size / 2;
      const collision = placed.some(p => !(end < p.start || start > p.end));
      if (!collision) placed.push({ start, end });
      return { value: t, hidden: collision };
    });
  }, [rawTicks, showLabels, orientation, tickFormat, scale, avoidLabelOverlap, resolvedTickFontSize]);

  const rootStyle: any = {
    position: 'absolute',
    left: offset.x || 0,
    top: offset.y || 0,
  };

  const resolvedTickColor = tickLabelColor ?? theme.colors.textSecondary;
  const resolvedLabelColor = labelColor ?? theme.colors.textPrimary;
  const resolvedLabelFontSize = labelFontSize ?? 12;

  // Tick-label box widths. Horizontal labels are centered under the tick; vertical
  // labels are right-aligned against the axis line. Both default to the widest
  // label they have to hold, so nothing is reserved that nothing will use — and
  // nothing wraps mid-word inside a box that was too small for it.
  const widestTick = useMemo(
    () => rawTicks.reduce(
      (widest, tick) => Math.max(widest, estimateChartTextWidth(String(tickFormat ? tickFormat(tick) : tick), resolvedTickFontSize)),
      0,
    ),
    [rawTicks, tickFormat, resolvedTickFontSize],
  );
  const hLabelWidth = tickLabelWidth ?? Math.max(Math.ceil(widestTick), 24);
  const vLabelWidth = tickLabelWidth ?? Math.max(Math.ceil(widestTick), 24);
  // Vertical labels never wrap: a category like "Engineering" broken across two
  // lines reads as two categories. Horizontal ones may take a second line, since
  // the padding math reserves for exactly that.
  const hLabelLines = tickLabelLines ?? 1;
  // How far the vertical tick labels reach to the left of the axis line, and where
  // the (rotated) axis title should sit so it always clears those labels.
  const vTickExtent = tickSize + tickPadding + vLabelWidth;
  const vTitleCenter = vTickExtent + AXIS_TITLE_GAP + resolvedLabelFontSize / 2;
  // Axis titles are laid out in a fixed-width box (rotated ones about its center).
  // Sized to the title unless the caller pins it, so "Investment (USD thousands)"
  // stays on one line rather than stacking into the plot.
  // Titles render semibold, which runs a few percent wider than the estimator's
  // regular-weight advances — without the allowance the last word ellipsises.
  const titleBoxWidth = labelWidth ?? Math.ceil(estimateChartTextWidth(label ?? '', resolvedLabelFontSize) * 1.08) + 6;
  const titleBoxHalf = titleBoxWidth / 2;
  // How far past the axis line the title sits. Derived from the labels it has to
  // clear, so a caller that doesn't guess gets a title that never collides.
  const resolvedLabelOffset = labelOffset
    ?? tickSize + tickPadding + (showLabels ? Math.round(resolvedTickFontSize * 1.3) * hLabelLines : 0) + AXIS_TITLE_GAP;
  // A rotated title keeps the box's center, so centering it along the axis means
  // placing the box's *height* — one text line — at the midpoint, not its width.
  const titleLineHalf = (resolvedLabelFontSize * 1.3) / 2;

  return (
    <View style={[rootStyle, style]} pointerEvents="none">
      {showLine && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: isHorizontal ? length : strokeWidth,
            height: isHorizontal ? strokeWidth : length,
            backgroundColor: stroke,
          }}
        />
      )}
      {processedTicks.map((tObj, i) => {
        const { value: t, hidden } = tObj;
        const pos = scale(t);
        // A tick generator that rounds the domain up emits values past the end of
        // the scale; drawing them puts a stray label outside the plot entirely.
        if (!Number.isFinite(pos) || pos < -0.5 || pos > length + 0.5) return null;
        const key = `tick-${i}`;
        const anchor = isHorizontal
          ? { left: pos, top: 0, transform: [{ translateX: -0.5 }] }
          : { top: pos, left: 0, transform: [{ translateY: -0.5 }] };
        // Ticks point away from the plot on every edge. They used to always be
        // drawn down/right of the axis line, which put a left axis's ticks
        // *inside* the plot and left each chart to cancel it out in its offset.
        const tickLineStyle: any = {
          position: 'absolute',
          backgroundColor: stroke,
          ...(orientation === 'bottom' && { top: 0, left: 0, width: strokeWidth, height: tickSize }),
          ...(orientation === 'top' && { top: -tickSize, left: 0, width: strokeWidth, height: tickSize }),
          ...(orientation === 'left' && { top: 0, left: -tickSize, width: tickSize, height: strokeWidth }),
          ...(orientation === 'right' && { top: 0, left: 0, width: tickSize, height: strokeWidth }),
        };
        const tickTextGap = tickSize + tickPadding;
        const halfLine = Math.round(resolvedTickFontSize * 1.3 / 2);
        const baseLabelStyle: TextStyle = {
          position: 'absolute',
          color: resolvedTickColor,
          fontSize: resolvedTickFontSize,
          // `numberOfLines` makes react-native-web add `max-width: 100%`, and the
          // tick anchor these sit in is a zero-width point — without an explicit
          // cap to beat that rule, every label collapses to nothing.
          maxWidth: isHorizontal ? hLabelWidth : vLabelWidth,
          ...(orientation === 'bottom' && {
            top: tickTextGap, left: -hLabelWidth / 2, width: hLabelWidth, textAlign: 'center',
          }),
          ...(orientation === 'top' && {
            bottom: tickTextGap, left: -hLabelWidth / 2, width: hLabelWidth, textAlign: 'center',
          }),
          ...(orientation === 'left' && {
            left: -(tickTextGap + vLabelWidth), top: -halfLine, width: vLabelWidth, textAlign: 'right',
          }),
          ...(orientation === 'right' && {
            left: tickTextGap, top: -halfLine, width: vLabelWidth, textAlign: 'left',
          }),
        };
        const combinedTickLabelStyle = [baseLabelStyle, tickLabelStyle];
        return (
          <View key={key} style={[{ position: 'absolute' }, anchor]}>
            {showTicks && <View style={tickLineStyle} />}
            {showLabels && !hidden && (
              <Text
                style={combinedTickLabelStyle}
                numberOfLines={isHorizontal ? hLabelLines : 1}
                ellipsizeMode="tail"
              >
                {tickFormat ? tickFormat(t) : String(t)}
              </Text>
            )}
          </View>
        );
      })}
      {label && (
        <Text
          style={{
            position: 'absolute',
            color: resolvedLabelColor,
            fontSize: resolvedLabelFontSize,
            fontWeight: '600',
            // See the tick labels: `numberOfLines` brings `max-width: 100%` with it.
            maxWidth: titleBoxWidth,
            ...(orientation === 'bottom' && { top: resolvedLabelOffset, left: length / 2 - titleBoxHalf, width: titleBoxWidth, textAlign: 'center' }),
            ...(orientation === 'top' && { bottom: resolvedLabelOffset, left: length / 2 - titleBoxHalf, width: titleBoxWidth, textAlign: 'center' }),
            // Rotated titles are laid out in that same box, then rotated about their
            // center, so the visible centerline sits at (left + half). Place that center a
            // fixed distance beyond the tick labels so the title never overlaps them.
            ...(orientation === 'left' && { top: length / 2 - titleLineHalf, left: -vTitleCenter - titleBoxHalf, width: titleBoxWidth, textAlign: 'center', transform: [{ rotate: '-90deg' }] }),
            ...(orientation === 'right' && { top: length / 2 - titleLineHalf, left: vTitleCenter - titleBoxHalf, width: titleBoxWidth, textAlign: 'center', transform: [{ rotate: '90deg' }] }),
            ...labelStyle,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

Axis.displayName = 'Chart.Axis';
