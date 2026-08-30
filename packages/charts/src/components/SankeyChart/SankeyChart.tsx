import React from 'react';
import { View, Text, Platform } from 'react-native';
import Svg, { Path, Rect, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { SankeyChartProps, SankeyNode, SankeyLink, SankeyInconsistency } from './types';
import { ChartContainer, ChartTitle, estimateChartTextWidth, measureChartTitleBand } from '../../ChartBase';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import type { ActiveTarget } from '../../core/hittest/types';
import { getColorFromScheme, colorSchemes } from '../../utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface InternalNode {
  id: string;
  label: string;
  layer: number;
  in: number;
  out: number;
  value: number;
  color: string;
  x: number;
  y: number;
  height: number;
  /** Which side of the node its label is drawn on. */
  labelSide: 'left' | 'right';
  /** Label after truncation to the space available on that side. */
  displayLabel: string;
  /** True when the label crosses the flows and needs a halo behind it. */
  labelOverFlows: boolean;
  valueLabel: string;
  raw?: SankeyNode;
}

interface InternalLink {
  key: string;
  source: string;
  target: string;
  value: number;
  color: string;
  path: string;
  sy: number;
  ty: number;
  thickness: number;
  raw: SankeyLink;
}

/** Gap between a node and its label. */
const LABEL_GAP = 8;
const LABEL_FONT_SIZE = 11;
/** Space between a node's name and its value. */
const VALUE_GAP = 6;

// Animated Sankey Node Component
interface AnimatedSankeyNodeProps {
  node: InternalNode;
  nodeWidth: number;
  animationProgress: SharedValue<number>;
  index: number;
  dataSignature: string;
  disabled: boolean;
  theme: any;
  onHover?: () => void;
  onHoverOut?: () => void;
  highlightAlpha: number;
}

const AnimatedSankeyNode: React.FC<AnimatedSankeyNodeProps> = React.memo(({
  node,
  nodeWidth,
  animationProgress,
  index,
  dataSignature,
  disabled,
  theme,
  onHover,
  onHoverOut,
  highlightAlpha,
}) => {
  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    const delay = index * 0.1;
    const nodeProgress = Math.max(0, Math.min(1, (progress - delay) / 0.3));
    
    return {
      opacity: nodeProgress * highlightAlpha,
      height: node.height * nodeProgress,
      y: node.y + (node.height * (1 - nodeProgress)) / 2,
    } as any;
  }, [index, node.height, node.y, dataSignature, highlightAlpha]);

  const isWeb = Platform.OS === 'web';
  const valueLabel = node.valueLabel;
  // Labels sit beside the node, never inside it. White text on a node whose
  // colour happens to be pale is unreadable, and a name centred on a 20px-wide
  // node spills out both sides of it.
  // Name and value are separate <Text> elements at measured offsets rather than
  // one element with a <TSpan>: react-native-svg does not advance the text cursor
  // for a TSpan on web, so the value landed on top of the end of the name.
  const nameWidth = estimateChartTextWidth(node.displayLabel, LABEL_FONT_SIZE);
  const valueWidth = valueLabel ? estimateChartTextWidth(valueLabel, LABEL_FONT_SIZE) : 0;
  const labelY = node.y + node.height / 2;
  const anchorX = node.labelSide === 'left' ? node.x - LABEL_GAP : node.x + nodeWidth + LABEL_GAP;
  const labelParts = node.labelSide === 'left'
    // Right-aligned against the node: the value trails the name, so the name
    // starts far enough left to leave room for it.
    ? [
        { key: 'name', text: node.displayLabel, x: anchorX - (valueWidth ? valueWidth + VALUE_GAP : 0), fill: theme.colors.textPrimary },
        ...(valueLabel ? [{ key: 'value', text: valueLabel, x: anchorX, fill: theme.colors.textSecondary }] : []),
      ]
    : [
        { key: 'name', text: node.displayLabel, x: anchorX, fill: theme.colors.textPrimary },
        ...(valueLabel ? [{ key: 'value', text: valueLabel, x: anchorX + nameWidth + VALUE_GAP, fill: theme.colors.textSecondary }] : []),
      ];
  const labelAnchor = node.labelSide === 'left' ? 'end' : 'start';

  return (
    <G>
      <AnimatedRect
        testID={`sankey-node-${node.id}`}
        animatedProps={animatedProps}
        x={node.x}
        width={nodeWidth}
        fill={node.color}
        rx={2}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        {...(isWeb
          ? {
              onPointerEnter: onHover,
              onPointerLeave: onHoverOut,
            }
          : {
              onPressIn: onHover,
              onPressOut: onHoverOut,
            })}
      />
      {node.displayLabel !== '' && labelParts.map(part => (
        <G key={part.key}>
          {/* A label between two columns crosses the flows behind it. Painting it
              twice — once as a thick stroke in the chart background, once filled —
              is the SVG halo trick, and keeps it readable over any link colour. */}
          {node.labelOverFlows && (
            <SvgText
              x={part.x}
              y={labelY}
              fontSize={LABEL_FONT_SIZE}
              fill="none"
              stroke={theme.colors.background}
              strokeWidth={3}
              strokeLinejoin="round"
              fontFamily={theme.fontFamily}
              textAnchor={labelAnchor as any}
              alignmentBaseline="central"
            >
              {part.text}
            </SvgText>
          )}
          <SvgText
            x={part.x}
            y={labelY}
            fontSize={LABEL_FONT_SIZE}
            fill={part.fill}
            fontFamily={theme.fontFamily}
            textAnchor={labelAnchor as any}
            alignmentBaseline="central"
          >
            {part.text}
          </SvgText>
        </G>
      ))}
    </G>
  );
});

AnimatedSankeyNode.displayName = 'AnimatedSankeyNode';

// Animated Sankey Link Component
interface AnimatedSankeyLinkProps {
  link: InternalLink;
  animationProgress: SharedValue<number>;
  index: number;
  dataSignature: string;
  disabled: boolean;
  onHover?: () => void;
  onHoverOut?: () => void;
  highlightAlpha: number;
}

const AnimatedSankeyLink: React.FC<AnimatedSankeyLinkProps> = React.memo(({
  link,
  animationProgress,
  index,
  dataSignature,
  disabled,
  onHover,
  onHoverOut,
  highlightAlpha,
}) => {
  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    const delay = 0.3 + (index * 0.05); // Links animate after nodes
    const linkProgress = Math.max(0, Math.min(1, (progress - delay) / 0.4));
    
    return {
      opacity: linkProgress * 0.6 * highlightAlpha,
      strokeWidth: link.thickness * linkProgress,
    } as any;
  }, [index, link.thickness, dataSignature, highlightAlpha]);

  const isWeb = Platform.OS === 'web';
  const valueLabel = Number.isFinite(link.value) ? link.value.toLocaleString() : '';
  const accessibilityLabel = valueLabel
    ? `${link.source} → ${link.target}: ${valueLabel}`
    : `${link.source} → ${link.target}`;

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={link.path}
      stroke={link.color}
      fill="none"
      // strokeLinecap="round"
      accessibilityLabel={accessibilityLabel}
      {...(!isWeb && { accessible: true })}
      {...(isWeb
        ? {
            onPointerEnter: onHover,
            onPointerLeave: onHoverOut,
            role: 'graphics-symbol',
            'aria-label': accessibilityLabel,
          }
        : {
            onPressIn: onHover,
            onPressOut: onHoverOut,
          })}
    />
  );
});

AnimatedSankeyLink.displayName = 'AnimatedSankeyLink';

export const SankeyChart: React.FC<SankeyChartProps> = (props) => {
  const {
    width = 600,
    height = 400,
    nodes,
    links,
    title,
    subtitle,
    style,
    animationDuration = 1000,
    disabled = false,
    nodeWidth: nodeWidthProp,
    nodePadding: nodePaddingProp,
    chartPadding,
    labelFormatter,
    valueFormatter,
    onNodeHover,
    onLinkHover,
    highlightOnHover = true,
    onDataInconsistency,
    ...rest
  } = props;
  const theme = useChartTheme();
  
  // Animation state
  const animationProgress = useSharedValue(disabled ? 1 : 0);
  
  // Data signature for memoization
  const dataSignature = React.useMemo(() => {
    return JSON.stringify({ 
      nodes: nodes?.map(n => ({ id: n.id, value: n.value })), 
      links: links?.map(l => ({ source: l.source, target: l.target, value: l.value }))
    });
  }, [nodes, links]);

  // Start animation when data changes
  React.useEffect(() => {
    if (disabled) return;
    
    animationProgress.value = 0;
    animationProgress.value = withDelay(
      100,
      withTiming(1, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [animationProgress, animationDuration, dataSignature, disabled]);
  
  // Defensive programming: handle empty data
  if (!nodes || nodes.length === 0) {
    return (
      <ChartContainer {...rest} width={width} height={height} style={style}>
        {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No nodes provided</Text>
        </View>
      </ChartContainer>
    );
  }
  
  if (!links || links.length === 0) {
    return (
      <ChartContainer {...rest} width={width} height={height} style={style}>
        {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No links provided</Text>
        </View>
      </ChartContainer>
    );
  }

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    // Interaction context is optional
  }

  const setPointer = interaction?.setPointer;
  const setActiveTarget = interaction?.setActiveTarget;
  const setActiveSlice = interaction?.setActiveSlice;

  const rawNodeMap = React.useMemo(() => {
    const map = new Map<string, SankeyNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [nodes]);

  const formatLabel = React.useCallback(
    (nodeId: string) => {
      const raw = rawNodeMap.get(nodeId);
      if (raw && labelFormatter) {
        const formatted = labelFormatter(raw);
        if (formatted) return formatted;
      }
      if (raw?.name) return raw.name;
      return raw?.id ?? nodeId;
    },
    [labelFormatter, rawNodeMap]
  );

  const formatValueLabel = React.useCallback(
    (nodeId: string, value: number) => {
      const raw = rawNodeMap.get(nodeId);
      if (valueFormatter) {
        const formatted = valueFormatter(value, raw);
        if (formatted !== undefined && formatted !== null) return formatted;
      }
      return Number.isFinite(value) ? value.toLocaleString() : '';
    },
    [valueFormatter, rawNodeMap]
  );

  const paddingOverrides = React.useMemo(
    () => ({
      top: chartPadding?.top,
      right: chartPadding?.right,
      bottom: chartPadding?.bottom,
      left: chartPadding?.left,
    }),
    [chartPadding]
  );

  const layout = React.useMemo(() => {
    const idSet = new Set(nodes.map(node => node.id));
    const outgoing: Record<string, string[]> = {};
    const incoming: Record<string, string[]> = {};
    links.forEach(link => {
      if (!idSet.has(link.source) || !idSet.has(link.target)) return;
      (outgoing[link.source] ||= []).push(link.target);
      (incoming[link.target] ||= []).push(link.source);
    });

    const layer: Record<string, number> = {};
    const queue: string[] = [];
    nodes.forEach(node => {
      if (!incoming[node.id]) {
        layer[node.id] = 0;
        queue.push(node.id);
      }
    });
    while (queue.length) {
      const current = queue.shift()!;
      (outgoing[current] || []).forEach(target => {
        const candidate = (layer[current] ?? 0) + 1;
        if (layer[target] == null || candidate > layer[target]) {
          layer[target] = candidate;
          queue.push(target);
        }
      });
    }
    nodes.forEach(node => {
      if (layer[node.id] == null) layer[node.id] = 0;
    });

    const maxLayer = Math.max(0, ...Object.values(layer));
    const layerCount = maxLayer + 1;

    const nodeAgg: Record<string, { in: number; out: number; value: number }> = {};
    nodes.forEach(node => {
      nodeAgg[node.id] = { in: 0, out: 0, value: node.value ?? 0 };
    });
    links.forEach(link => {
      if (!nodeAgg[link.source] || !nodeAgg[link.target]) return;
      nodeAgg[link.source].out += link.value;
      nodeAgg[link.target].in += link.value;
    });

    const inconsistencies: SankeyInconsistency[] = [];
    Object.entries(nodeAgg).forEach(([id, agg]) => {
      agg.value = Math.max(agg.value, agg.in, agg.out, 1e-9);
      if (Math.abs(agg.in - agg.out) > 1e-6) {
        inconsistencies.push({ nodeId: id, inbound: agg.in, outbound: agg.out });
      }
    });

    // The first and last columns label outward, into the margin, so the margin is
    // sized from those labels. Everything in between labels inward, over its own
    // flows, and costs nothing here.
    const labelWidth = (name: string, value: string) =>
      estimateChartTextWidth(name, LABEL_FONT_SIZE)
      + (value ? VALUE_GAP + estimateChartTextWidth(value, LABEL_FONT_SIZE) : 0);

    const labelWidthFor = (predicate: (layerIndex: number) => boolean) => {
      let widest = 0;
      nodes.forEach((node) => {
        const layerIndex = layer[node.id];
        if (layerIndex == null || !predicate(layerIndex)) return;
        widest = Math.max(
          widest,
          labelWidth(formatLabel(node.id), formatValueLabel(node.id, nodeAgg[node.id]?.value ?? 0)),
        );
      });
      return widest;
    };
    // Ceil, not round: the label-fit test below subtracts the same two gaps back
    // out, so a margin rounded *down* by a hair drops the value off the very
    // label the margin was measured from.
    const outerMargin = (widest: number, cap: number) =>
      Math.ceil(Math.min(widest + LABEL_GAP * 2, Math.max(48, cap)));

    const widestFirst = labelWidthFor((index) => index === 0);
    const widestLast = labelWidthFor((index) => index === layerCount - 1);
    // A margin is capped at a quarter of the chart while both sides want one;
    // a single margin can afford a third, since nothing is paying for the other.
    const outerLeft = outerMargin(widestFirst, width * 0.26);
    const outerRight = outerMargin(widestLast, width * 0.26);
    const outerRightAlone = outerMargin(widestLast, width * 0.34);

    /**
     * Where each terminal column puts its labels.
     *
     * Outside reads best — sources down the left edge, destinations down the
     * right, nothing over the flows — but each side costs a fixed margin, and on
     * a phone the pair was taking more than half the width and squeezing the
     * diagram into a strip.
     *
     * The two sides are not equally expensive to give up, though. The first
     * column can label inward for free: it points right, across its own outgoing
     * flows, into a gap no other column wants. The last column has no gap after
     * it — pointing inward puts it head-to-head with the column before it, and
     * both end up truncated to three characters. So when space is short the left
     * margin goes first and the right one is kept.
     */
    const insideGutter = 8;
    const bothOutside = outerLeft + outerRight <= width * 0.4;
    const rightMargin = bothOutside ? outerRight : outerRightAlone;
    const keepRightMargin = bothOutside || rightMargin <= width * 0.34;
    const placement = {
      first: bothOutside ? 'outside' as const : 'inside' as const,
      last: keepRightMargin ? 'outside' as const : 'inside' as const,
    };

    const resolvedPadding = {
      top: paddingOverrides.top ?? Math.max(12, measureChartTitleBand(title, subtitle)),
      bottom: paddingOverrides.bottom ?? 16,
      left: paddingOverrides.left ?? (placement.first === 'outside' ? outerLeft : insideGutter),
      right: paddingOverrides.right ?? (placement.last === 'outside' ? rightMargin : insideGutter),
    };

    const plotW = Math.max(1, width - resolvedPadding.left - resolvedPadding.right);
    const plotH = Math.max(1, height - resolvedPadding.top - resolvedPadding.bottom);

    // 8% of the plot put a 40px slab between every pair of columns — width that a
    // dense diagram needs for its labels. This is the d3-sankey range instead.
    const autoNodeWidth = Math.min(24, Math.max(10, plotW * 0.02));
    const resolvedNodeWidth = Math.max(6, Math.min(nodeWidthProp ?? autoNodeWidth, plotW * 0.25));
    const resolvedNodePadding = Math.max(4, nodePaddingProp ?? Math.max(8, plotH * 0.02));

    const layerNodes: Record<number, InternalNode[]> = {};
    nodes.forEach((node, index) => {
      const layerIndex = layer[node.id];
      const color = node.color || getColorFromScheme(index, colorSchemes.default);
      const internalNode: InternalNode = {
        id: node.id,
        label: formatLabel(node.id),
        layer: layerIndex,
        in: nodeAgg[node.id].in,
        out: nodeAgg[node.id].out,
        value: nodeAgg[node.id].value,
        color,
        x: 0,
        y: 0,
        height: 0,
        labelSide: 'right',
        displayLabel: '',
        labelOverFlows: false,
        valueLabel: '',
        raw: rawNodeMap.get(node.id),
      };
      (layerNodes[layerIndex] ||= []).push(internalNode);
    });

    const colW = layerCount > 1 ? (plotW - resolvedNodeWidth) / (layerCount - 1) : 0;
    const maxLayerTotal = Math.max(
      1,
      ...Object.values(layerNodes).map(list => list.reduce((sum, node) => sum + node.value, 0))
    );
    const maxLayerNodeCount = Math.max(1, ...Object.values(layerNodes).map(list => list.length));

    const gapUpperBound = maxLayerNodeCount > 1
      ? Math.max(2, (plotH / (maxLayerNodeCount - 1)) * 0.6)
      : resolvedNodePadding;
    const globalGap = Math.min(resolvedNodePadding, gapUpperBound);
    const globalAvailableHeight = Math.max(1, plotH - globalGap * Math.max(0, maxLayerNodeCount - 1));
    const minNodeHeightGlobal = Math.max(1.5, Math.min(6, globalAvailableHeight / maxLayerNodeCount));
    const globalUnit = globalAvailableHeight / maxLayerTotal;

    Object.entries(layerNodes).forEach(([layerIndexStr, list]) => {
      const layerIndex = Number(layerIndexStr);
      const totalValue = list.reduce((sum, node) => sum + node.value, 0);
      const totalGap = globalGap * Math.max(0, list.length - 1);
      const layerHeight = totalValue * globalUnit + totalGap;
      const offsetY = resolvedPadding.top + Math.max(0, (plotH - layerHeight) / 2);

      let cursor = offsetY;
      list.sort((a, b) => b.value - a.value);
      const layerAvailableHeight = Math.max(
        1,
        plotH - globalGap * Math.max(0, list.length - 1)
      );
      const layerMinHeight = Math.max(
        1.5,
        Math.min(minNodeHeightGlobal, layerAvailableHeight / Math.max(1, list.length))
      );
      list.forEach(node => {
        node.height = Math.max(layerMinHeight, node.value * globalUnit);
        node.x = resolvedPadding.left + (layerCount > 1 ? layerIndex * colW : (plotW - resolvedNodeWidth) / 2);
        node.y = cursor;
        node.valueLabel = formatValueLabel(node.id, node.value);
        cursor += node.height + globalGap;
      });
    });

    // Label placement, once every node has an x.
    const truncateToWidth = (text: string, budget: number) => {
      if (budget <= 0) return '';
      if (estimateChartTextWidth(text, LABEL_FONT_SIZE) <= budget) return text;
      let trimmed = text;
      while (trimmed.length > 1 && estimateChartTextWidth(`${trimmed}…`, LABEL_FONT_SIZE) > budget) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed.length > 1 ? `${trimmed.trimEnd()}…` : '';
    };

    // Space between one column's nodes and the next column's.
    const columnGap = Math.max(0, colW - resolvedNodeWidth - LABEL_GAP);
    const allNodes = Object.values(layerNodes).flat();

    /**
     * Whether a column shows its values at all.
     *
     * Values are dropped per column rather than per node: one column reading
     * "Solar / Wind 32 / Hydro" — where only the label that happened to fit kept
     * its number — looks like missing data rather than a layout decision.
     */
    const columnShowsValue: Record<number, boolean> = {};
    const budgetFor = (node: InternalNode) => {
      const isFirstColumn = node.layer === 0;
      const isLastColumn = node.layer === layerCount - 1 && layerCount > 1;
      const outward = (isFirstColumn && placement.first === 'outside')
        || (isLastColumn && placement.last === 'outside');
      // With the last column labelling inward there is one gap two columns point
      // into; they split it so a right-pointing label and the left-pointing one
      // opposite can't meet in the middle. Every other gap has a single claimant.
      const sharedGap = placement.last === 'inside'
        && layerCount > 1
        && (node.layer === layerCount - 1 || node.layer === layerCount - 2);
      return outward
        ? (isFirstColumn ? resolvedPadding.left : resolvedPadding.right) - LABEL_GAP * 2
        : sharedGap
          ? columnGap / 2 - LABEL_GAP
          : columnGap;
    };

    allNodes.forEach((node) => {
      const fits = labelWidth(node.label, node.valueLabel) <= budgetFor(node);
      columnShowsValue[node.layer] = (columnShowsValue[node.layer] ?? true) && fits;
    });

    allNodes.forEach((node) => {
      const isFirstColumn = node.layer === 0;
      const isLastColumn = node.layer === layerCount - 1 && layerCount > 1;
      const outward = (isFirstColumn && placement.first === 'outside')
        || (isLastColumn && placement.last === 'outside');

      // Outward: the first column reads right-to-left into the left margin, the
      // last column left-to-right into the right one. Inward: everything points
      // right, except the last column, which has no column after it to point at.
      node.labelSide = outward
        ? (isFirstColumn ? 'left' : 'right')
        : (isLastColumn ? 'left' : 'right');
      node.labelOverFlows = !outward;

      const budget = budgetFor(node);

      // The value is the first thing to go — a name without its number still
      // says what the flow is — and it goes for the whole column at once.
      if (!columnShowsValue[node.layer]) node.valueLabel = '';
      node.displayLabel = labelWidth(node.label, node.valueLabel) <= budget
        ? node.label
        : truncateToWidth(node.label, budget);
    });

    /**
     * Drops labels that would print over one another.
     *
     * Per-column culling was not enough once the terminal columns started
     * labelling inward: a label reaching right across a gap meets the one
     * reaching left from the next column. Bigger nodes are placed first, so what
     * survives a crowd is the flow that matters most.
     */
    const lineHeight = LABEL_FONT_SIZE * 1.15;
    const placed: { x0: number; x1: number; y0: number; y1: number }[] = [];
    [...allNodes]
      .sort((a, b) => b.value - a.value)
      .forEach((node) => {
        if (node.displayLabel === '') return;
        const textWidth = labelWidth(node.displayLabel, node.valueLabel);
        const anchorX = node.labelSide === 'left'
          ? node.x - LABEL_GAP
          : node.x + resolvedNodeWidth + LABEL_GAP;
        const center = node.y + node.height / 2;
        const rect = {
          x0: node.labelSide === 'left' ? anchorX - textWidth : anchorX,
          x1: node.labelSide === 'left' ? anchorX : anchorX + textWidth,
          y0: center - lineHeight / 2,
          y1: center + lineHeight / 2,
        };
        const collides = placed.some(other =>
          rect.x0 < other.x1 && rect.x1 > other.x0 && rect.y0 < other.y1 && rect.y1 > other.y0);
        if (collides) {
          node.displayLabel = '';
          node.valueLabel = '';
          return;
        }
        placed.push(rect);
      });

    const internalNodes = Object.values(layerNodes).flat();
    const nodeIndex: Record<string, InternalNode> = {};
    internalNodes.forEach(node => {
      nodeIndex[node.id] = node;
    });

    const sourceOffset: Record<string, number> = {};
    const targetOffset: Record<string, number> = {};
    internalNodes.forEach(node => {
      const agg = nodeAgg[node.id];
      const outgoingThickness = agg.out * globalUnit;
      const incomingThickness = agg.in * globalUnit;
      sourceOffset[node.id] = Math.max(0, (node.height - outgoingThickness) / 2);
      targetOffset[node.id] = Math.max(0, (node.height - incomingThickness) / 2);
    });

    const internalLinks: InternalLink[] = [];
    links.forEach((link, index) => {
      const sourceNode = nodeIndex[link.source];
      const targetNode = nodeIndex[link.target];
      if (!sourceNode || !targetNode) return;
      if (!(link.value > 0)) return;

      const thickness = link.value * globalUnit;
      const sourceOffsetValue = sourceOffset[sourceNode.id] ?? 0;
      const targetOffsetValue = targetOffset[targetNode.id] ?? 0;

      const sy = sourceNode.y + sourceOffsetValue + thickness / 2;
      const ty = targetNode.y + targetOffsetValue + thickness / 2;

      sourceOffset[sourceNode.id] = sourceOffsetValue + thickness;
      targetOffset[targetNode.id] = targetOffsetValue + thickness;

      const x0 = sourceNode.x + resolvedNodeWidth;
      const x1 = targetNode.x;
      const dx = x1 - x0;
      const mx = x0 + dx * 0.5;

      const path = dx > 0
        ? `M ${x0} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${x1} ${ty}`
        : `M ${x0} ${sy} Q ${x0 + 20} ${(sy + ty) / 2} ${x1} ${ty}`;

      internalLinks.push({
        key: `${link.source}->${link.target}-${index}`,
        source: sourceNode.id,
        target: targetNode.id,
        value: link.value,
        color: link.color || sourceNode.color,
        path,
        sy,
        ty,
        thickness,
        raw: link,
      });
    });

    return {
      internalNodes,
      internalLinks,
      layerCount,
      nodeAgg,
      padding: resolvedPadding,
      plotW,
      plotH,
      nodeWidth: resolvedNodeWidth,
      nodePadding: globalGap,
      inconsistencies,
    };
  }, [nodes, links, width, height, paddingOverrides, title, subtitle, nodeWidthProp, nodePaddingProp, rawNodeMap, formatLabel, formatValueLabel]);

  const { internalNodes, internalLinks, nodeWidth: resolvedNodeWidth, inconsistencies, padding } = layout;

  React.useEffect(() => {
    if (!onDataInconsistency) return;
    onDataInconsistency(inconsistencies);
  }, [inconsistencies, onDataInconsistency]);

  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [hoveredLinkKey, setHoveredLinkKey] = React.useState<string | null>(null);
  const highlightEnabled = highlightOnHover !== false;

  const linkByKey = React.useMemo(() => {
    const map = new Map<string, InternalLink>();
    internalLinks.forEach(link => map.set(link.key, link));
    return map;
  }, [internalLinks]);

  const nodeById = React.useMemo(() => {
    const map = new Map<string, (typeof internalNodes)[number]>();
    internalNodes.forEach(node => map.set(node.id, node));
    return map;
  }, [internalNodes]);

  const activeNodeIds = React.useMemo(() => {
    if (!highlightEnabled) return null;
    if (hoveredNodeId) {
      const set = new Set<string>([hoveredNodeId]);
      internalLinks.forEach(link => {
        if (link.source === hoveredNodeId || link.target === hoveredNodeId) {
          set.add(link.source);
          set.add(link.target);
        }
      });
      return set;
    }
    if (hoveredLinkKey) {
      const link = linkByKey.get(hoveredLinkKey);
      if (link) {
        return new Set<string>([link.source, link.target]);
      }
    }
    return null;
  }, [highlightEnabled, hoveredNodeId, hoveredLinkKey, internalLinks, linkByKey]);

  const activeLinkKeys = React.useMemo(() => {
    if (!highlightEnabled) return null;
    if (hoveredNodeId) {
      return new Set(
        internalLinks
          .filter(link => link.source === hoveredNodeId || link.target === hoveredNodeId)
          .map(link => link.key)
      );
    }
    if (hoveredLinkKey) {
      return new Set<string>([hoveredLinkKey]);
    }
    return null;
  }, [highlightEnabled, hoveredNodeId, hoveredLinkKey, internalLinks]);

  const resolveNodeAlpha = React.useCallback(
    (nodeId: string) => {
      if (!highlightEnabled || !activeNodeIds) return 1;
      return activeNodeIds.has(nodeId) ? 1 : 0.3;
    },
    [highlightEnabled, activeNodeIds]
  );

  const resolveLinkAlpha = React.useCallback(
    (key: string) => {
      if (!highlightEnabled || !activeLinkKeys) return 1;
      return activeLinkKeys.has(key) ? 1 : 0.25;
    },
    [highlightEnabled, activeLinkKeys]
  );

  const clearActive = React.useCallback(() => {
    setActiveTarget?.(null);
    setActiveSlice?.([]);
  }, [setActiveTarget, setActiveSlice]);

  const handleNodeHover = React.useCallback(
    (id: string | null) => {
      if (highlightEnabled) {
        setHoveredNodeId(id);
        if (id !== null) setHoveredLinkKey(null);
      }
      if (onNodeHover) {
        onNodeHover(id ? rawNodeMap.get(id) ?? null : null);
      }
      // Engine-swap: a hovered node is a single ActiveTarget (element-hover flow).
      if (!id) { clearActive(); return; }
      const node = nodeById.get(id);
      if (!node) { clearActive(); return; }
      const target: ActiveTarget = {
        seriesId: 'sankey-nodes',
        markId: node.id,
        kind: 'cell',
        datum: node.raw ?? node,
        pixel: { x: node.x + resolvedNodeWidth / 2, y: node.y + node.height / 2 },
        value: node.value,
        distance: 0,
        label: node.label,
        color: node.color,
        formattedValue: formatValueLabel(node.id, node.value),
        customTooltip: `${node.label} · ${formatValueLabel(node.id, node.value)} (in ${formatValueLabel(node.id, node.in)} · out ${formatValueLabel(node.id, node.out)})`,
      };
      setActiveTarget?.(target);
      setActiveSlice?.([target]);
    },
    [highlightEnabled, onNodeHover, rawNodeMap, nodeById, resolvedNodeWidth, formatValueLabel, setActiveTarget, setActiveSlice, clearActive]
  );

  const handleLinkHover = React.useCallback(
    (key: string | null) => {
      if (highlightEnabled) {
        setHoveredLinkKey(key);
        if (key !== null) setHoveredNodeId(null);
      }
      if (onLinkHover) {
        onLinkHover(key ? linkByKey.get(key)?.raw ?? null : null);
      }
      // Engine-swap: a hovered link is a single ActiveTarget anchored at its mid-span.
      if (!key) { clearActive(); return; }
      const link = linkByKey.get(key);
      if (!link) { clearActive(); return; }
      const src = nodeById.get(link.source);
      const tgt = nodeById.get(link.target);
      const px = src && tgt ? (src.x + resolvedNodeWidth + tgt.x) / 2 : (link.sy + link.ty) / 2;
      const target: ActiveTarget = {
        seriesId: 'sankey-links',
        markId: link.key,
        kind: 'cell',
        datum: link.raw ?? link,
        pixel: { x: px, y: (link.sy + link.ty) / 2 },
        value: link.value,
        distance: 0,
        label: `${nodeById.get(link.source)?.label ?? link.source} → ${nodeById.get(link.target)?.label ?? link.target}`,
        color: link.color,
        formattedValue: formatValueLabel(link.source, link.value),
      };
      setActiveTarget?.(target);
      setActiveSlice?.([target]);
    },
    [highlightEnabled, onLinkHover, linkByKey, nodeById, resolvedNodeWidth, formatValueLabel, setActiveTarget, setActiveSlice, clearActive]
  );

  const clearHover = React.useCallback(() => {
    handleNodeHover(null);
    handleLinkHover(null);
  }, [handleNodeHover, handleLinkHover]);

  return (
    <ChartContainer {...rest} width={width} height={height} style={style} interactionConfig={{ multiTooltip:true }}>
      {(title||subtitle) && <ChartTitle title={title} subtitle={subtitle} />}
      <Svg
        width={width}
        height={height}
        style={{ position:'absolute', left:0, top:0 }}
        // @ts-expect-error web
        onMouseMove={(e)=>{
          if(!setPointer) return; const rect = (e.currentTarget as any).getBoundingClientRect();
          const px = e.clientX - rect.left; const py = e.clientY - rect.top;
          setPointer({ x:px, y:py, inside:true, pageX:e.pageX, pageY:e.pageY });
        }}
        onMouseLeave={() => {
          clearHover();
          setPointer?.({ x: 0, y: 0, inside: false });
        }}
       >
        <G>
          {internalLinks.map((l,i)=> (
            <AnimatedSankeyLink
              key={l.key}
              link={l}
              animationProgress={animationProgress}
              index={i}
              dataSignature={dataSignature}
              disabled={disabled}
              highlightAlpha={resolveLinkAlpha(l.key)}
              onHover={() => handleLinkHover(l.key)}
              onHoverOut={() => handleLinkHover(null)}
            />
          ))}
          {internalNodes.map((n, i) => (
            <AnimatedSankeyNode
              key={n.id}
              node={n}
              nodeWidth={resolvedNodeWidth}
              animationProgress={animationProgress}
              index={i}
              dataSignature={dataSignature}
              disabled={disabled}
              theme={theme}
              onHover={() => handleNodeHover(n.id)}
              onHoverOut={() => handleNodeHover(null)}
              highlightAlpha={resolveNodeAlpha(n.id)}
            />
          ))}
        </G>
      </Svg>
      {internalNodes.length===0 && (
        <View style={{ position:'absolute', inset:0, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize:12 }}>No data</Text>
        </View>
      )}
    </ChartContainer>
  );
};
SankeyChart.displayName = 'SankeyChart';
