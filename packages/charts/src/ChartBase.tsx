import React, { useEffect } from 'react';
import { View, Text, Pressable, I18nManager } from 'react-native';
import { useChartTheme } from './theme/ChartThemeContext';
import { BaseChartProps } from './types';
import { ChartInteractionProvider, useOptionalChartInteraction } from './interaction/ChartInteractionContext';
import { ChartActiveTooltip } from './interaction/ChartActiveTooltip';
import { useElementOffset } from './interaction/useElementOffset';
import { isWeb } from './utils/platform';

// Lightweight spacing props (decoupled from ui). Extend later if needed.
export interface SpacingProps {
  m?: number; mt?: number; mr?: number; mb?: number; ml?: number; mx?: number; my?: number;
  p?: number; pt?: number; pr?: number; pb?: number; pl?: number; px?: number; py?: number;
}

const extractSpacing = (props: any): { spacing: SpacingProps; rest: any } => {
  const spacing: SpacingProps = {};
  const rest: any = {};
  Object.keys(props).forEach(k => {
    if (['m', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'].includes(k)) spacing[k as keyof SpacingProps] = props[k];
    else rest[k] = props[k];
  });
  return { spacing, rest };
};

const spacingToStyle = (s: SpacingProps) => {
  const style: any = {};
  if (s.m != null) style.margin = s.m;
  if (s.mx != null) { style.marginLeft = s.mx; style.marginRight = s.mx; }
  if (s.my != null) { style.marginTop = s.my; style.marginBottom = s.my; }
  if (s.mt != null) style.marginTop = s.mt;
  if (s.mr != null) style.marginRight = s.mr;
  if (s.mb != null) style.marginBottom = s.mb;
  if (s.ml != null) style.marginLeft = s.ml;
  if (s.p != null) style.padding = s.p;
  if (s.px != null) { style.paddingLeft = s.px; style.paddingRight = s.px; }
  if (s.py != null) { style.paddingTop = s.py; style.paddingBottom = s.py; }
  if (s.pt != null) style.paddingTop = s.pt;
  if (s.pr != null) style.paddingRight = s.pr;
  if (s.pb != null) style.paddingBottom = s.pb;
  if (s.pl != null) style.paddingLeft = s.pl;
  return style;
};

// Base Chart Container Component
export const ChartContainer: React.FC<BaseChartProps & {
  children: React.ReactNode;
  padding?: { top: number; right: number; bottom: number; left: number };
  interactionConfig?: any;
  /** If false, assumes parent has provided a ChartInteractionProvider. */
  useOwnInteractionProvider?: boolean;
  /** Suppress the internal shared tooltip (useful when sharing one globally). */
  suppressPopover?: boolean;
}> = (props) => {
  const {
    width = 400,
    height = 300,
    padding = { top: 20, right: 20, bottom: 40, left: 60 },
    animationDuration = 500,
    animationEasing = 'ease-out',
    disabled = false,
    children,
    testID,
    style,
    interactionConfig,
    useOwnInteractionProvider = true,
    suppressPopover,
    ...rest
  } = props;

  const { spacing, rest: otherProps } = extractSpacing(rest);
  const spacingStyles = spacingToStyle(spacing);

  // If a parent ChartsProvider supplies interaction context (useOwnInteractionProvider=false) we default to suppressing
  const effectiveSuppressPopover = suppressPopover ?? !useOwnInteractionProvider;

  const content = (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: 'transparent',
          position: 'relative',
          overflow: 'visible',
        },
        spacingStyles,
        style,
      ]}
      testID={testID}
      {...otherProps}
    >
      {children}
      {!effectiveSuppressPopover && <ChartActiveTooltip />}
    </View>
  );

  if (!useOwnInteractionProvider) {
    return content;
  }

  return (
    <ChartInteractionProvider config={interactionConfig}>
      <RootOffsetCapture>{content}</RootOffsetCapture>
    </ChartInteractionProvider>
  );
};

// Internal component to capture the container's page offset cross-platform
// (web: getBoundingClientRect + scroll; native: measureInWindow). Feeds the
// interaction store so the popover can position correctly on both platforms.
const RootOffsetCapture: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ctx = useOptionalChartInteraction();
  const { offset, onLayout, ref } = useElementOffset();

  useEffect(() => {
    ctx?.setRootOffset?.({ left: offset.left, top: offset.top });
  }, [ctx, offset.left, offset.top]);

  return (
    <View ref={ref} onLayout={onLayout} style={{ position: 'relative' }}>
      {children}
    </View>
  );
};

// ChartTitle and ChartLegend are absolutely-positioned overlays on the container, so a
// chart that draws into the full box — every radial one — lands underneath them unless it
// reserves their bands first. These metrics live next to the components that render them
// so the two can't drift apart.
export const CHART_TITLE_FONT_SIZE = 18;
export const CHART_SUBTITLE_FONT_SIZE = 14;
const TITLE_PADDING_VERTICAL = 5;
const TITLE_SUBTITLE_GAP = 4;

export const CHART_LEGEND_PADDING = 10;
const LEGEND_SWATCH_SIZE = 12;
const LEGEND_SWATCH_GAP = 6;
const LEGEND_ITEM_MARGIN_H = 8;
const LEGEND_ITEM_MARGIN_V = 4;
const LEGEND_FONT_SIZE = 12;

/** Average glyph advance for the chart sans stack — close enough to reserve space by. */
export const estimateChartTextWidth = (text: string, fontSize: number) =>
  text.length * fontSize * 0.58;

/** Height ChartTitle occupies, including a gap before whatever is drawn below it. */
export const measureChartTitleBand = (
  title?: string,
  subtitle?: string,
  options?: { titleSize?: number; subtitleSize?: number; gap?: number },
): number => {
  if (!title && !subtitle) return 0;
  const titleSize = options?.titleSize ?? CHART_TITLE_FONT_SIZE;
  const subtitleSize = options?.subtitleSize ?? CHART_SUBTITLE_FONT_SIZE;
  let band = TITLE_PADDING_VERTICAL * 2;
  if (title) band += Math.round(titleSize * 1.35);
  if (subtitle) band += (title ? TITLE_SUBTITLE_GAP : 0) + Math.round(subtitleSize * 1.35);
  return band + (options?.gap ?? 8);
};

export interface ChartLegendBand {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Space ChartLegend occupies on the edge it is pinned to. Horizontal legends are packed
 * into rows against the container width, so a legend that wraps reserves every row it needs
 * rather than only the first.
 */
export const measureChartLegendBand = (options: {
  items: Array<{ label: string }> | undefined;
  containerWidth: number;
  position?: 'top' | 'right' | 'bottom' | 'left';
  fontSize?: number;
}): ChartLegendBand => {
  const empty: ChartLegendBand = { top: 0, right: 0, bottom: 0, left: 0 };
  const { items, containerWidth } = options;
  if (!items || items.length === 0) return empty;

  const position = options.position ?? 'bottom';
  const fontSize = options.fontSize ?? LEGEND_FONT_SIZE;
  const itemWidths = items.map(
    (item) => LEGEND_SWATCH_SIZE + LEGEND_SWATCH_GAP + estimateChartTextWidth(item.label, fontSize),
  );

  if (position === 'left' || position === 'right') {
    const widest = itemWidths.reduce((max, value) => Math.max(max, value), 0);
    // Never let a long series name eat more than a third of the chart.
    const band = Math.min(
      widest + CHART_LEGEND_PADDING * 2,
      Math.round(containerWidth / 3),
    );
    return { ...empty, [position]: band };
  }

  const rowHeight = Math.max(LEGEND_SWATCH_SIZE, Math.round(fontSize * 1.35)) + LEGEND_ITEM_MARGIN_V;
  const available = Math.max(containerWidth - CHART_LEGEND_PADDING * 2, 1);
  let rows = 1;
  let used = 0;
  itemWidths.forEach((itemWidth) => {
    const total = itemWidth + LEGEND_ITEM_MARGIN_H * 2;
    if (used > 0 && used + total > available) {
      rows += 1;
      used = total;
    } else {
      used += total;
    }
  });
  return { ...empty, [position]: rows * rowHeight + CHART_LEGEND_PADDING * 2 };
};

export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Grows a chart's axis padding so the plot clears the ChartTitle and ChartLegend overlays.
 *
 * The title shares the top padding region — nothing else is drawn up there — so the two take
 * whichever is larger. A legend stacks beyond the axis labels rather than overlapping them,
 * so its band is added on. Pass `legendItems` only when the legend is actually rendered;
 * charts disagree on whether `legend.show` defaults to true, and that stays their business.
 *
 * Charts with neither a title nor a legend keep their padding untouched.
 */
export const withChartBandPadding = (
  basePadding: ChartPadding,
  options: {
    title?: string;
    subtitle?: string;
    legendItems?: Array<{ label: string }>;
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    legendFontSize?: number;
    containerWidth: number;
    /**
     * Space above the plot that is *not* the title — an axis title or a top tick label that
     * shares the band. Stacks below the title instead of competing with it.
     */
    topAllowance?: number;
  },
): ChartPadding => {
  const titleBand = measureChartTitleBand(options.title, options.subtitle);
  const legendBand = measureChartLegendBand({
    items: options.legendItems,
    containerWidth: options.containerWidth,
    position: options.legendPosition,
    fontSize: options.legendFontSize,
  });

  return {
    top: Math.max(basePadding.top, titleBand + (options.topAllowance ?? 0)) + legendBand.top,
    right: basePadding.right + legendBand.right,
    bottom: basePadding.bottom + legendBand.bottom,
    left: basePadding.left + legendBand.left,
  };
};

// Chart Title Component
export const ChartTitle: React.FC<{
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: number;
  subtitleSize?: number;
  align?: 'left' | 'center' | 'right';
  style?: any;
}> = (props) => {
  const {
    title,
    subtitle,
    titleColor,
    subtitleColor,
    titleSize = CHART_TITLE_FONT_SIZE,
    subtitleSize = CHART_SUBTITLE_FONT_SIZE,
    align = 'center',
    style,
  } = props;

  const theme = useChartTheme();

  if (!title && !subtitle) return null;

  const alignStyle = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[align];

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          alignItems: alignStyle,
          paddingHorizontal: 10,
          paddingVertical: TITLE_PADDING_VERTICAL,
          zIndex: 10,
        },
        style,
      ]}
    >
      {title && (
        <Text
          style={{
            fontSize: titleSize,
            fontWeight: '600',
            color: titleColor || theme.colors.textPrimary,
            textAlign: align,
          }}
        >
          {title}
        </Text>
      )}
      {subtitle && (
        <Text
          style={{
            fontSize: subtitleSize,
            fontWeight: '400',
            color: subtitleColor || theme.colors.textSecondary,
            textAlign: align,
            marginTop: title ? TITLE_SUBTITLE_GAP : 0,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

// Chart Legend Component
export const ChartLegend: React.FC<{
  items: Array<{ label: string; color: string; visible?: boolean }>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  textColor?: string;
  fontSize?: number;
  /** onItemPress now receives (item, index, nativeEvent?) where nativeEvent may hold modifier keys (altKey, metaKey, shiftKey, ctrlKey) on web */
  onItemPress?: (item: any, index: number, nativeEvent?: any) => void;
  style?: any;
}> = (props) => {
  const {
    items,
    position = 'bottom',
    align = 'center',
    textColor,
    fontSize = LEGEND_FONT_SIZE,
    onItemPress,
    style,
  } = props;

  const theme = useChartTheme();
  // Pressable's onPress event (RN / RN Web) often omits modifier keys; capture last pointerdown globally (web only)
  const lastMods = React.useRef<{ altKey: boolean; metaKey: boolean; shiftKey: boolean; ctrlKey: boolean }>({ altKey: false, metaKey: false, shiftKey: false, ctrlKey: false });
  React.useEffect(() => {
    // Only register global pointer listener on web where window API exists
    if (!isWeb()) return;
    const handler = (e: any) => {
      lastMods.current = {
        altKey: !!e.altKey,
        metaKey: !!e.metaKey,
        shiftKey: !!e.shiftKey,
        ctrlKey: !!e.ctrlKey,
      };
    };
    window.addEventListener('pointerdown', handler, { passive: true } as any);
    return () => window.removeEventListener('pointerdown', handler as any);
  }, []);

  if (!items || items.length === 0) return null;

  const isHorizontal = position === 'top' || position === 'bottom';
  const alignStyle = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }[align];

  const positionStyle = {
    top: { top: 0, left: 0, right: 0 },
    bottom: { bottom: 0, left: 0, right: 0 },
    left: { left: 0, top: 0, bottom: 0 },
    right: { right: 0, top: 0, bottom: 0 },
  }[position];

  // Determine an accessible legend text color when host theme background is dark
  const computeReadable = React.useCallback((fallback: string) => {
    const hex = (fallback || '').startsWith('#') ? fallback : theme.colors.textPrimary;
    const bg = theme.colors.background || '#000';
    const parse = (h: string) => {
      const s = h.replace('#', '');
      if (s.length === 3) return [parseInt(s[0] + s[0], 16), parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16)];
      return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
    };
    const lum = (r: number, g: number, b: number) => {
      const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const [br, bgG, bb] = parse(bg);
    const bgLum = lum(br, bgG, bb);
    if (bgLum < 0.35) return '#f5f6f8';
    return fallback || hex;
  }, [theme.colors.background, theme.colors.textPrimary]);

  const isRTL = I18nManager.isRTL;

  return (
    <View
      style={[
        {
          position: 'absolute',
          ...positionStyle,
          flexDirection: isHorizontal ? (isRTL ? 'row-reverse' : 'row') : 'column',
          alignItems: alignStyle,
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: CHART_LEGEND_PADDING,
          zIndex: 10,
        },
        style,
      ]}
    >
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={(e: any) => {
            const native = e?.nativeEvent || {};
            const enriched = { ...native, ...lastMods.current };
            onItemPress?.(item, index, enriched);
          }}
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            marginHorizontal: isHorizontal ? LEGEND_ITEM_MARGIN_H : 0,
            marginVertical: isHorizontal ? 0 : LEGEND_ITEM_MARGIN_V,
            opacity: item.visible !== false ? 1 : 0.5,
          }}
        >
          <View
            style={{
              width: LEGEND_SWATCH_SIZE,
              height: LEGEND_SWATCH_SIZE,
              backgroundColor: item.color,
              borderRadius: 2,
              ...(isRTL ? { marginLeft: LEGEND_SWATCH_GAP } : { marginRight: LEGEND_SWATCH_GAP }),
            }}
          />
          <Text
            style={{
              fontSize,
              color: textColor || computeReadable(theme.colors.textPrimary),
              fontFamily: theme.fontFamily,
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// Display names
ChartContainer.displayName = 'Chart.Container';
ChartTitle.displayName = 'Chart.Title';
ChartLegend.displayName = 'Chart.Legend';
