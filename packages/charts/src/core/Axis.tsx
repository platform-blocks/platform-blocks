import React, { useMemo } from 'react';
import { View, Text, TextStyle } from 'react-native';
import { Scale } from '../utils/scales';
import { useChartTheme } from '../theme/ChartThemeContext';

export interface AxisProps {
  scale: Scale<any>;
  orientation: 'left' | 'right' | 'top' | 'bottom';
  length: number; // pixel length of the axis line
  offset?: { x?: number; y?: number };
  tickCount?: number;
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
  /** Width of the (centered) tick-label box. Wider values prevent long labels from
   *  wrapping/clipping. Defaults to 72 for horizontal axes, 30 for vertical. */
  tickLabelWidth?: number;
  labelColor?: string;
  labelFontSize?: number;
  labelStyle?: TextStyle;
  /** Width of the axis-title box. Widen it so a long title stays on one line. */
  labelWidth?: number;
}

// Simple axis renderer (View-based). For high performance / crisp lines use SVG later.
export const Axis: React.FC<AxisProps> = ({
  scale,
  orientation,
  length,
  offset = {},
  tickCount = 5,
  tickSize = 4,
  tickPadding = 4,
  tickFormat,
  label,
  labelOffset = 30,
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
  labelColor,
  labelFontSize,
  labelStyle,
  labelWidth,
}) => {
  const theme = useChartTheme();
  const isHorizontal = orientation === 'top' || orientation === 'bottom';
  const domain = scale.domain();
  let rawTicks: any[] = [];
  if (scale.ticks) rawTicks = scale.ticks(tickCount);
  else if (Array.isArray(domain)) rawTicks = domain;

  const processedTicks = useMemo(() => {
    if (!showLabels) return rawTicks.map(t => ({ value: t, hidden: false }));
    if (!(orientation === 'bottom' || orientation === 'top') || !avoidLabelOverlap) {
      return rawTicks.map(t => ({ value: t, hidden: false }));
    }
    const estWidth = (val: any) => String(tickFormat ? tickFormat(val) : val).length * 6.5;
    const placed: { start: number; end: number }[] = [];
    return rawTicks.map(t => {
      const x = scale(t);
      const w = estWidth(t);
      const start = x - w / 2;
      const end = x + w / 2;
      const collision = placed.some(p => !(end < p.start || start > p.end));
      if (!collision) placed.push({ start, end });
      return { value: t, hidden: collision };
    });
  }, [rawTicks, showLabels, orientation, tickFormat, scale, avoidLabelOverlap]);

  const rootStyle: any = {
    position: 'absolute',
    left: offset.x || 0,
    top: offset.y || 0,
  };

  const resolvedTickColor = tickLabelColor ?? theme.colors.textSecondary;
  const resolvedTickFontSize = tickLabelFontSize ?? 11;
  const resolvedLabelColor = labelColor ?? theme.colors.textPrimary;
  const resolvedLabelFontSize = labelFontSize ?? 12;

  // Tick-label box widths. Horizontal labels are centered under the tick; vertical
  // labels are right-aligned against the axis line. The vertical default is wide
  // enough that numeric labels (e.g. "$500k", "5,000") don't wrap to two lines.
  const hLabelWidth = tickLabelWidth ?? 72;
  const vLabelWidth = tickLabelWidth ?? 44;
  // How far the vertical tick labels reach to the left of the axis line, and where
  // the (rotated) axis title should sit so it always clears those labels.
  const vTickExtent = tickSize + tickPadding + vLabelWidth;
  const vTitleGap = 8;
  const vTitleCenter = vTickExtent + vTitleGap + resolvedLabelFontSize / 2;
  // Axis titles are laid out in a fixed-width box (rotated ones about its center).
  const titleBoxWidth = labelWidth ?? 100;
  const titleBoxHalf = titleBoxWidth / 2;
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
        const key = `tick-${i}`;
        const anchor = isHorizontal
          ? { left: pos, top: 0, transform: [{ translateX: -0.5 }] }
          : { top: pos, left: 0, transform: [{ translateY: -0.5 }] };
        const tickLineStyle: any = isHorizontal
          ? { position: 'absolute', top: 0, left: 0, width: strokeWidth, height: tickSize, backgroundColor: stroke }
          : { position: 'absolute', top: 0, left: 0, width: tickSize, height: strokeWidth, backgroundColor: stroke };
        const baseLabelStyle: TextStyle = isHorizontal
          ? {
              position: 'absolute',
              top: tickSize + tickPadding,
              left: -hLabelWidth / 2,
              width: hLabelWidth,
              textAlign: 'center',
              color: resolvedTickColor,
              fontSize: resolvedTickFontSize,
            }
          : {
              position: 'absolute',
              left: -(tickSize + tickPadding + vLabelWidth),
              top: -8,
              width: vLabelWidth,
              textAlign: 'right',
              color: resolvedTickColor,
              fontSize: resolvedTickFontSize,
            };
        const combinedTickLabelStyle = [baseLabelStyle, tickLabelStyle];
        return (
          <View key={key} style={[{ position: 'absolute' }, anchor]}>
            {showTicks && <View style={tickLineStyle} />}
            {showLabels && !hidden && (
              <Text style={combinedTickLabelStyle}>{tickFormat ? tickFormat(t) : String(t)}</Text>
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
            ...(orientation === 'bottom' && { top: labelOffset, left: length / 2 - titleBoxHalf, width: titleBoxWidth, textAlign: 'center' }),
            ...(orientation === 'top' && { top: -labelOffset, left: length / 2 - titleBoxHalf, width: titleBoxWidth, textAlign: 'center' }),
            // Rotated titles are laid out in that same box, then rotated about their
            // center, so the visible centerline sits at (left + half). Place that center a
            // fixed distance beyond the tick labels so the title never overlaps them.
            ...(orientation === 'left' && { top: length / 2 - titleLineHalf, left: -vTitleCenter - titleBoxHalf, width: titleBoxWidth, textAlign: 'center', transform: [{ rotate: '-90deg' }] }),
            ...(orientation === 'right' && { top: length / 2 - titleLineHalf, left: vTitleCenter - titleBoxHalf, width: titleBoxWidth, textAlign: 'center', transform: [{ rotate: '90deg' }] }),
            ...labelStyle,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

Axis.displayName = 'Chart.Axis';
