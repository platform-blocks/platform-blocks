import React from 'react';
import { View, Text } from 'react-native';
import Svg from 'react-native-svg';
import type { NetworkChartProps } from './types';
import type { ChartGrid as ChartGridConfig } from '../../types/base';
import { ChartContainer, ChartTitle } from '../../ChartBase';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { generateTicks, createTickFormatter } from '../../utils';
import { linearScale as createLinearScale } from '../../utils/scales';
import { AnimatedLink } from './AnimatedLink';
import { AnimatedNode } from './AnimatedNode';
import { useNetworkSimulation } from './useNetworkSimulation';
import type { ActiveTarget } from '../../core/hittest/types';
import { useAnimatedNetworkRendering } from './useAnimatedNetworkRendering';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value instanceof Date) return value.getTime();
  return 0;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const NetworkChart: React.FC<NetworkChartProps> = (props) => {
  const {
    w: width = 600,
    h: height = 400,
    nodes,
    links,
    title,
    subtitle,
    style,
    layout = 'force',
    grid,
    xAxis,
    yAxis,
    padding: paddingOverride,
    coordinateAccessor,
    showLabels = true,
    nodeRadius = 12,
    nodeRadiusRange,
    nodeValueAccessor,
    linkWidthRange,
    linkColorAccessor,
    linkOpacityAccessor,
    linkShape: linkShapeMode = 'straight',
    linkCurveStrength: linkCurveStrengthProp = 0.35,
    linkPalette,
    onNodeFocus,
    onNodeBlur,
    onNodePress,
    onLinkFocus,
    onLinkBlur,
    onLinkPress,
    animationDuration,
    disabled = false,
    ...rest
  } = props;

  const theme = useChartTheme();
  // Keyed by contents: a new palette array with the same colors must not restart the layout.
  const paletteKey = theme.colors.accentPalette.join('|');
  const nodePalette = React.useMemo(() => theme.colors.accentPalette, [paletteKey]);

  const resolvedLinkPalette = React.useMemo(() => {
    if (Array.isArray(linkPalette) && linkPalette.length) {
      return linkPalette;
    }
    return theme.colors.accentPalette || [];
  }, [linkPalette, theme.colors.accentPalette]);

  const resolvedLinkCurveStrength = React.useMemo(
    () => Math.max(0, linkCurveStrengthProp),
    [linkCurveStrengthProp]
  );

  const nodeLookup = React.useMemo(() => {
    const map = new Map<string, { node: typeof nodes[number]; index: number }>();
    nodes.forEach((node, index) => {
      map.set(node.id, { node, index });
    });
    return map;
  }, [nodes]);

  const hasNodeEvents = Boolean(onNodeFocus || onNodeBlur || onNodePress);
  const hasLinkEvents = Boolean(onLinkFocus || onLinkBlur || onLinkPress);
  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    console.warn('NetworkChart: render within a ChartInteractionProvider to enable shared interactions');
  }

  const setPointer = interaction?.setPointer;
  const setActiveTarget = interaction?.setActiveTarget;
  const setActiveSlice = interaction?.setActiveSlice;

  const resolvedWidth = width;
  const resolvedHeight = height;

  const padding = React.useMemo(() => {
    const hasXAxis = layout === 'coordinate' && xAxis?.show !== false;
    const hasYAxis = layout === 'coordinate' && yAxis?.show !== false;
    const baseTop = title || subtitle ? 56 : 36;
    const base: { top: number; right: number; bottom: number; left: number } = {
      top: baseTop,
      right: 32,
      bottom: hasXAxis ? 56 : 24,
      left: hasYAxis ? 64 : 32,
    };
    if (!paddingOverride) return base;
    return {
      top: paddingOverride.top ?? base.top,
      right: paddingOverride.right ?? base.right,
      bottom: paddingOverride.bottom ?? base.bottom,
      left: paddingOverride.left ?? base.left,
    };
  }, [layout, paddingOverride, title, subtitle, xAxis?.show, yAxis?.show]);

  const plotWidth = Math.max(1, resolvedWidth - padding.left - padding.right);
  const plotHeight = Math.max(1, resolvedHeight - padding.top - padding.bottom);

  const accessorX = coordinateAccessor?.x;
  const accessorY = coordinateAccessor?.y;

  const xDomain = React.useMemo<[number, number]>(() => {
    if (layout !== 'coordinate') return [0, plotWidth];
    const values = nodes
      .map((node, index) => toNumber(accessorX ? accessorX(node, index) : node.x))
      .filter((value) => Number.isFinite(value));
    if (!values.length) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return [min - 1, min + 1];
    return [min, max];
  }, [layout, nodes, accessorX, plotWidth]);

  const yDomain = React.useMemo<[number, number]>(() => {
    if (layout !== 'coordinate') return [0, plotHeight];
    const values = nodes
      .map((node, index) => toNumber(accessorY ? accessorY(node, index) : node.y))
      .filter((value) => Number.isFinite(value));
    if (!values.length) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return [min - 1, min + 1];
    return [min, max];
  }, [layout, nodes, accessorY, plotHeight]);

  const scaleX = React.useMemo(() => {
    if (layout !== 'coordinate') return null;
    return createLinearScale(xDomain, [0, plotWidth]);
  }, [layout, xDomain, plotWidth]);

  const scaleY = React.useMemo(() => {
    if (layout !== 'coordinate') return null;
    return createLinearScale(yDomain, [plotHeight, 0]);
  }, [layout, yDomain, plotHeight]);

  const resolvedGrid = React.useMemo<ChartGridConfig | null>(() => {
    if (layout !== 'coordinate') return null;
    if (!grid) return null;
    if (grid === true) return { show: true } as ChartGridConfig;
    return { show: grid.show ?? true, ...grid } as ChartGridConfig;
  }, [grid, layout]);

  const xTicks = React.useMemo(() => {
    if (layout !== 'coordinate') return [] as number[];
    if (Array.isArray(xAxis?.ticks) && xAxis.ticks.length) {
      return xAxis.ticks;
    }
    return generateTicks(xDomain[0], xDomain[1], 5);
  }, [layout, xAxis?.ticks, xDomain]);

  const yTicks = React.useMemo(() => {
    if (layout !== 'coordinate') return [] as number[];
    if (Array.isArray(yAxis?.ticks) && yAxis.ticks.length) {
      return yAxis.ticks;
    }
    return generateTicks(yDomain[0], yDomain[1], 5);
  }, [layout, yAxis?.ticks, yDomain]);

  const normalizedXTicks = React.useMemo(() => {
    if (layout !== 'coordinate') return [];
    const span = xDomain[1] - xDomain[0];
    if (!Number.isFinite(span) || span === 0) return [];
    return xTicks
      .map((tick) => {
        const numeric = typeof tick === 'number' ? tick : Number(tick);
        if (!Number.isFinite(numeric)) return null;
        return (numeric - xDomain[0]) / span;
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }, [layout, xTicks, xDomain]);

  const normalizedYTicks = React.useMemo(() => {
    if (layout !== 'coordinate') return [];
    const span = yDomain[1] - yDomain[0];
    if (!Number.isFinite(span) || span === 0) return [];
    return yTicks
      .map((tick) => {
        const numeric = typeof tick === 'number' ? tick : Number(tick);
        if (!Number.isFinite(numeric)) return null;
        const ratio = (numeric - yDomain[0]) / span;
        return 1 - ratio;
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }, [layout, yTicks, yDomain]);

  const xTickFormatter = React.useMemo(() => {
    if (typeof xAxis?.labelFormatter === 'function') return xAxis.labelFormatter;
    return createTickFormatter(xTicks, theme.numberFormat);
  }, [xAxis?.labelFormatter, xTicks, theme.numberFormat]);

  const yTickFormatter = React.useMemo(() => {
    if (typeof yAxis?.labelFormatter === 'function') return yAxis.labelFormatter;
    return createTickFormatter(yTicks, theme.numberFormat);
  }, [yAxis?.labelFormatter, yTicks, theme.numberFormat]);

  const simulation = useNetworkSimulation({
    nodes,
    links,
    width: plotWidth,
    height: plotHeight,
    layout,
  scaleX: scaleX ?? undefined,
  scaleY: scaleY ?? undefined,
    disabled,
    palette: nodePalette,
  });

  // Use refs to access current simulation state without triggering re-renders
  const nodesRef = React.useRef<typeof simulation.nodes>([]);
  const linksRef = React.useRef<typeof simulation.links>([]);
  
  // Update refs when simulation data changes
  React.useEffect(() => {
    nodesRef.current = simulation.nodes;
    linksRef.current = simulation.links;
  }, [simulation.nodes, simulation.links]);

  // Use optimized rendering hook that throttles updates
  const { renderNodes, renderLinks } = useAnimatedNetworkRendering({
    nodes: simulation.nodes,
    links: simulation.links,
    tick: simulation.tick,
  });

  const nodeValueFn = React.useMemo(() => {
    if (typeof nodeValueAccessor === 'function') {
      return (node: typeof nodes[number], index: number) =>
        toNumber(nodeValueAccessor(node, index));
    }
    return (node: typeof nodes[number]) => toNumber(node.value ?? 1);
  }, [nodeValueAccessor]);

  const nodeRadiusScale = React.useMemo(() => {
    if (!nodeRadiusRange) return null;
    const values = nodes
      .map((node, index) => nodeValueFn(node, index))
      .filter((value) => Number.isFinite(value));
    if (!values.length) return null;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const [minRadiusRaw, maxRadiusRaw] = nodeRadiusRange;
    const minRadius = Math.max(1, toNumber(minRadiusRaw));
    const maxRadius = Math.max(minRadius, toNumber(maxRadiusRaw));
    if (minValue === maxValue) {
      const constant = (minRadius + maxRadius) / 2;
      return () => constant;
    }
    const span = maxRadius - minRadius;
    const valueSpan = maxValue - minValue;
    return (value: number) => {
      if (!Number.isFinite(value)) return minRadius;
      const ratio = clamp01((value - minValue) / valueSpan);
      return minRadius + ratio * span;
    };
  }, [nodeRadiusRange, nodeValueFn, nodes]);

  const nodeRadiusMap = React.useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((node, index) => {
      const value = nodeValueFn(node, index);
      const resolvedRadius = nodeRadiusScale ? nodeRadiusScale(value) : nodeRadius;
      map.set(node.id, resolvedRadius);
    });
    return map;
  }, [nodes, nodeValueFn, nodeRadiusScale, nodeRadius]);

  const linkColorMap = React.useMemo(() => {
    const map = new Map<number, string>();
    links.forEach((link, index) => {
      const resolved = linkColorAccessor?.(link, index) ?? link.color;
      if (typeof resolved === 'string' && resolved.trim().length > 0) {
        map.set(index, resolved);
      }
    });
    return map;
  }, [links, linkColorAccessor]);

  const linkOpacityMap = React.useMemo(() => {
    const map = new Map<number, number>();
    links.forEach((link, index) => {
      const candidate = linkOpacityAccessor?.(link, index);
      const resolved = candidate ?? link.opacity;
      if (typeof resolved === 'number' && Number.isFinite(resolved)) {
        map.set(index, clamp01(resolved));
      }
    });
    return map;
  }, [links, linkOpacityAccessor]);

  const linkWidthOverrideMap = React.useMemo(() => {
    const map = new Map<number, number>();
    links.forEach((link, index) => {
      if (typeof link.width === 'number' && Number.isFinite(link.width)) {
        map.set(index, Math.max(0.5, link.width));
      }
    });
    return map;
  }, [links]);

  const linkWeightDomain = React.useMemo(() => {
    const weights = links
      .map((link) => toNumber(link.weight ?? 1))
      .filter((value) => Number.isFinite(value) && value >= 0);
    if (!weights.length) {
      return { min: 1, max: 1 } as const;
    }
    return { min: Math.min(...weights), max: Math.max(...weights) } as const;
  }, [links]);

  const resolvedLinkWidthRange = React.useMemo<[number, number]>(() => {
    if (!linkWidthRange || linkWidthRange.length !== 2) {
      return [1, 4];
    }
    const [rawMin, rawMax] = linkWidthRange;
    const minWidth = Math.max(0.5, toNumber(rawMin));
    const maxWidth = Math.max(minWidth, toNumber(rawMax));
    return [minWidth, maxWidth];
  }, [linkWidthRange]);

  const computeLinkWidth = React.useCallback(
    (weight: number, index: number) => {
      const override = linkWidthOverrideMap.get(index);
      if (override != null) {
        return override;
      }
      const [minWidth, maxWidth] = resolvedLinkWidthRange;
      const span = maxWidth - minWidth;
      const { min, max } = linkWeightDomain;
      if (!Number.isFinite(weight)) {
        return minWidth;
      }
      if (min === max) {
        return minWidth + span * 0.5;
      }
      const ratio = clamp01((weight - min) / (max - min));
      return minWidth + ratio * span;
    },
    [linkWidthOverrideMap, resolvedLinkWidthRange, linkWeightDomain]
  );

  const handlePointerMove = React.useCallback(
    (event: any) => {
      if (!setPointer) return;
      const rect = event.currentTarget?.getBoundingClientRect?.();
      if (!rect) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= plotWidth && y <= plotHeight;
      setPointer({
        x: x + padding.left,
        y: y + padding.top,
        inside,
        pageX: event.pageX,
        pageY: event.pageY,
      });
    },
    [plotWidth, plotHeight, padding.left, padding.top, setPointer]
  );

  const handlePointerLeave = React.useCallback(() => {
    if (!setPointer) return;
    setPointer({ x: 0, y: 0, inside: false });
  }, [setPointer]);

  // Engine-swap: a focused/hovered node is a single ActiveTarget (element-hover flow),
  // with nearest-node hit testing.
  const handleNodeFocus = React.useCallback(
    (node: { id: string; name?: string; color: string; x: number; y: number; value?: number }) => {
      const value = typeof node.value === 'number' ? node.value : 0;
      const target: ActiveTarget = {
        seriesId: 'network-nodes',
        markId: node.id,
        kind: 'point',
        datum: node,
        pixel: { x: node.x + padding.left, y: node.y + padding.top },
        value,
        distance: 0,
        label: node.name ?? node.id,
        color: node.color,
        formattedValue: typeof node.value === 'number' ? String(node.value) : node.name ?? node.id,
      };
      setActiveTarget?.(target);
      setActiveSlice?.([target]);
    },
    [padding.left, padding.top, setActiveTarget, setActiveSlice]
  );

  const handleNodeBlur = React.useCallback(() => {
    setActiveTarget?.(null);
    setActiveSlice?.([]);
  }, [setActiveTarget, setActiveSlice]);

  const panHandlers = (simulation.panHandlers ?? {}) as Record<string, unknown>;

  return (
    <ChartContainer
      w={resolvedWidth}
      h={resolvedHeight}
      style={style}
      animationDuration={animationDuration}
      disabled={disabled}
      interactionConfig={{
        enablePanZoom: layout === 'force',
        multiTooltip: true,
        liveTooltip: true,
      }}
      {...rest}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      {resolvedGrid && (
        <ChartGrid
          grid={resolvedGrid}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          xTicks={normalizedXTicks}
          yTicks={normalizedYTicks}
          padding={padding}
          useSVG
        />
      )}

      <View
        style={{
          position: 'absolute',
          left: padding.left,
          top: padding.top,
          width: plotWidth,
          height: plotHeight,
          // @ts-expect-error web-specific CSS properties
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        {...panHandlers}
      >
        <Svg
          width={plotWidth}
          height={plotHeight}
          // @ts-expect-error web specific events
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
        >
          {renderLinks.map((link) => {
            const paletteColor =
              resolvedLinkPalette.length > 0
                ? resolvedLinkPalette[link.index % resolvedLinkPalette.length]
                : undefined;
            const color =
              linkColorMap.get(link.index) ??
              link.color ??
              paletteColor ??
              theme.colors.grid;
            const rawOpacity = linkOpacityMap.get(link.index) ?? link.opacity ?? 0.5;
            const opacity = clamp01(typeof rawOpacity === 'number' ? rawOpacity : 0.5);
            const strokeWidth = computeLinkWidth(link.weight, link.index);
            const originalLink = links[link.index];
            const sourceMeta = nodeLookup.get(link.source.id);
            const targetMeta = nodeLookup.get(link.target.id);
            const linkPayload =
              hasLinkEvents && originalLink
                ? {
                    link: originalLink,
                    index: link.index,
                    source: {
                      node: sourceMeta?.node,
                      position: { x: link.source.x, y: link.source.y },
                    },
                    target: {
                      node: targetMeta?.node,
                      position: { x: link.target.x, y: link.target.y },
                    },
                    weight: link.weight,
                  }
                : null;

            return (
              <AnimatedLink
                key={`${link.source.id}-${link.target.id}-${link.index}`}
                testID={`network-link-${link.index}`}
                sourceX={link.source.x}
                sourceY={link.source.y}
                targetX={link.target.x}
                targetY={link.target.y}
                weight={link.weight}
                index={link.index}
                color={color}
                opacity={opacity}
                strokeWidth={strokeWidth}
                shape={linkShapeMode}
                curveStrength={resolvedLinkCurveStrength}
                parallelIndex={link.parallelIndex}
                parallelCount={link.parallelCount}
                onFocus={() => {
                  const sourceName = sourceMeta?.node?.name ?? link.source.id;
                  const targetName = targetMeta?.node?.name ?? link.target.id;
                  const target: ActiveTarget = {
                    seriesId: 'network-links',
                    markId: link.index,
                    kind: 'point',
                    datum: originalLink ?? link,
                    pixel: { x: (link.source.x + link.target.x) / 2 + padding.left, y: (link.source.y + link.target.y) / 2 + padding.top },
                    value: link.weight,
                    distance: 0,
                    label: `${sourceName} → ${targetName}`,
                    color,
                    formattedValue: String(link.weight),
                  };
                  setActiveTarget?.(target);
                  setActiveSlice?.([target]);
                  if (linkPayload && onLinkFocus) onLinkFocus(linkPayload);
                }}
                onBlur={() => {
                  handleNodeBlur();
                  if (linkPayload && onLinkBlur) onLinkBlur(linkPayload);
                }}
                onPress={linkPayload && onLinkPress ? () => onLinkPress(linkPayload) : undefined}
                onTouchStart={() => interaction?.cancelTouchHold()}
                onTouchRelease={() => interaction?.holdTouchTarget()}
              />
            );
          })}

          {renderNodes.map((node, idx) => {
            const originalNode = nodeLookup.get(node.id);
            const nodePayload =
              hasNodeEvents && originalNode
                ? {
                    node: originalNode.node,
                    index: originalNode.index,
                    position: { x: node.x, y: node.y },
                  }
                : null;

            return (
              <AnimatedNode
                key={node.id}
                id={node.id}
                testID={`network-node-${node.id}`}
                x={node.x}
                y={node.y}
                color={node.color}
                label={node.name}
                radius={nodeRadiusMap.get(node.id) ?? nodeRadius}
                index={idx}
                disabled={disabled}
                theme={theme}
                showLabel={showLabels}
                onFocus={() => {
                  handleNodeFocus(node);
                  if (nodePayload && onNodeFocus) onNodeFocus(nodePayload);
                }}
                onBlur={() => {
                  handleNodeBlur();
                  if (nodePayload && onNodeBlur) onNodeBlur(nodePayload);
                }}
                onPress={nodePayload && onNodePress ? () => onNodePress(nodePayload) : undefined}
                onTouchStart={() => interaction?.cancelTouchHold()}
                onTouchRelease={() => interaction?.holdTouchTarget()}
              />
            );
          })}
        </Svg>
      </View>

      {layout === 'coordinate' && xAxis?.show !== false && plotWidth > 0 && (
        <Axis
          scale={scaleX ?? createLinearScale(xDomain, [0, plotWidth])}
          orientation="bottom"
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={xTicks.length}
          tickFormat={xTickFormatter}
          tickSize={xAxis?.tickLength ?? 4}
          tickPadding={4}
          showLabels={xAxis?.showLabels !== false}
          showTicks={xAxis?.showTicks !== false}
          stroke={xAxis?.color || theme.colors.grid}
          strokeWidth={xAxis?.thickness ?? 1}
          tickLabelColor={xAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={xAxis?.labelFontSize}
          label={xAxis?.title}
          labelColor={xAxis?.titleColor || theme.colors.textPrimary}
          labelFontSize={xAxis?.titleFontSize}
          labelOffset={xAxis?.title ? (xAxis?.titleFontSize ?? 12) + 20 : 32}
        />
      )}

      {layout === 'coordinate' && yAxis?.show !== false && plotHeight > 0 && (
        <Axis
          scale={scaleY ?? createLinearScale(yDomain, [plotHeight, 0])}
          orientation="left"
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          tickCount={yTicks.length}
          tickFormat={yTickFormatter}
          tickSize={yAxis?.tickLength ?? 4}
          tickPadding={4}
          showLabels={yAxis?.showLabels !== false}
          showTicks={yAxis?.showTicks !== false}
          stroke={yAxis?.color || theme.colors.grid}
          strokeWidth={yAxis?.thickness ?? 1}
          tickLabelColor={yAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={yAxis?.labelFontSize}
          label={yAxis?.title}
          labelColor={yAxis?.titleColor || theme.colors.textPrimary}
          labelFontSize={yAxis?.titleFontSize}
          labelOffset={yAxis?.title ? (yAxis?.titleFontSize ?? 12) + 20 : 32}
        />
      )}

      {renderNodes.length === 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No data</Text>
        </View>
      )}
    </ChartContainer>
  );
};

NetworkChart.displayName = 'NetworkChart';
