import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, type PanResponderInstance } from 'react-native';
import { getColorFromScheme } from '../../utils';
import type { NetworkNode, NetworkLink, NetworkLayoutMode } from './types';

export interface SimulationNode {
  id: string;
  name?: string;
  group?: string | number;
  value: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
  meta?: any;
}

export interface SimulationLink {
  source: string;
  target: string;
  weight: number;
  meta?: any;
  color?: string;
  opacity?: number;
  width?: number;
}

export interface UseNetworkSimulationOptions {
  nodes: NetworkNode[];
  links: NetworkLink[];
  width: number;
  height: number;
  layout: NetworkLayoutMode;
  scaleX?: ((value: number) => number) | null;
  scaleY?: ((value: number) => number) | null;
  disabled?: boolean;
  /** Categorical palette for nodes without their own color */
  palette: string[];
}

export interface UseNetworkSimulationResult {
  nodes: SimulationNode[];
  links: SimulationLink[];
  tick: number;
  panHandlers?: PanResponderInstance['panHandlers'];
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value instanceof Date) return value.getTime();
  return 0;
};

export const useNetworkSimulation = ({
  nodes,
  links,
  width,
  height,
  layout,
  scaleX,
  scaleY,
  disabled = false,
  palette,
}: UseNetworkSimulationOptions): UseNetworkSimulationResult => {
  const nodesRef = useRef<SimulationNode[]>([]);
  const linksRef = useRef<SimulationLink[]>([]);
  const frameRef = useRef<number | null>(null);
  const alphaRef = useRef(0);
  const frameCounterRef = useRef(0);
  const draggingRef = useRef<SimulationNode | null>(null);
  const [tick, setTick] = useState(0);

  const initializeStaticLayout = useCallback(() => {
    if (layout === 'force') return;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const centerX = width / 2;
    const centerY = height / 2;

    const positioned = new Map<string, { x: number; y: number }>();

    if (layout === 'coordinate') {
      nodes.forEach((node) => {
        const baseX = node.x ?? node.meta?.x;
        const baseY = node.y ?? node.meta?.y;
        const px = scaleX ? scaleX(toNumber(baseX)) : toNumber(baseX);
        const py = scaleY ? scaleY(toNumber(baseY)) : toNumber(baseY);
        if (Number.isFinite(px) && Number.isFinite(py)) {
          positioned.set(node.id, { x: px, y: py });
        }
      });
    } else if (layout === 'circular') {
      const count = Math.max(1, nodes.length);
      const radius = Math.max(32, Math.min(width, height) * 0.4);
      nodes.forEach((node, index) => {
        const angle = (index / count) * Math.PI * 2;
        positioned.set(node.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      });
    } else if (layout === 'radial') {
      const grouped = nodes.reduce<Map<string | number, NetworkNode[]>>((acc, node) => {
        const key = node.group ?? 'ungrouped';
        const bucket = acc.get(key) || [];
        bucket.push(node);
        acc.set(key, bucket);
        return acc;
      }, new Map());

      if (grouped.size === 0) {
        const fallbackRadius = Math.max(32, Math.min(width, height) * 0.35);
        const total = Math.max(1, nodes.length);
        nodes.forEach((node, index) => {
          const angle = (index / total) * Math.PI * 2;
          positioned.set(node.id, {
            x: centerX + Math.cos(angle) * fallbackRadius,
            y: centerY + Math.sin(angle) * fallbackRadius,
          });
        });
      } else {
        const maxRadius = Math.max(48, Math.min(width, height) * 0.45);
        const rings = Array.from(grouped.entries());
        const spacing = Math.max(36, maxRadius / Math.max(1, rings.length));
        rings.forEach(([_, members], ringIndex) => {
          const ringRadius = Math.min(maxRadius, spacing * (ringIndex + 1));
          const memberCount = Math.max(1, members.length);
          members.forEach((member, memberIndex) => {
            const angle = (memberIndex / memberCount) * Math.PI * 2;
            positioned.set(member.id, {
              x: centerX + Math.cos(angle) * ringRadius,
              y: centerY + Math.sin(angle) * ringRadius,
            });
          });
        });
      }
    }

    nodesRef.current = nodes.map((node, index) => {
      const position = positioned.get(node.id) ?? { x: centerX, y: centerY };
      return {
        id: node.id,
        name: node.name,
        group: node.group,
        value: node.value ?? 1,
        color: node.color || getColorFromScheme(index, palette),
        x: position.x,
        y: position.y,
        vx: 0,
        vy: 0,
        meta: node.meta,
      } as SimulationNode;
    });

    linksRef.current = links.map((link) => ({
      source: link.source,
      target: link.target,
      weight: link.weight ?? 1,
      meta: link.meta,
      color: link.color,
      opacity: link.opacity,
      width: link.width,
    }));

    alphaRef.current = 0;
    frameCounterRef.current = 0;
    setTick((t) => t + 1);
  }, [height, layout, links, nodes, scaleX, scaleY, width, palette]);

  const initializeForceLayout = useCallback(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    nodesRef.current = nodes.map((node, index) => {
      const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2;
      return {
        id: node.id,
        name: node.name,
        group: node.group,
        value: node.value ?? 1,
        color: node.color || getColorFromScheme(index, palette),
        x: centerX + Math.cos(angle) * (width * 0.25),
        y: centerY + Math.sin(angle) * (height * 0.25),
        vx: 0,
        vy: 0,
        meta: node.meta,
      } as SimulationNode;
    });
    linksRef.current = links.map((link) => ({
      source: link.source,
      target: link.target,
      weight: link.weight ?? 1,
      meta: link.meta,
      color: link.color,
      opacity: link.opacity,
      width: link.width,
    }));
    alphaRef.current = disabled ? 0 : 1;
    if (!frameRef.current && !disabled) {
      frameRef.current = requestAnimationFrame(() => step());
    }
    setTick((t) => t + 1);
  }, [disabled, height, links, nodes, width, palette]);

  const step = useCallback(() => {
    if (layout !== 'force') {
      frameRef.current = null;
      return;
    }
    const nodeArray = nodesRef.current;
    const linkArray = linksRef.current;
    const n = nodeArray.length;
    let alpha = alphaRef.current;

    if (alpha <= 0.02) {
      alphaRef.current = 0;
      frameRef.current = null;
      return;
    }

    const alphaDecay = 0.03; // Faster convergence

    // Only do expensive repulsion calculations every few frames
    const doRepulsion = frameCounterRef.current % 3 === 0;
    
    if (doRepulsion) {
      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          const a = nodeArray[i];
          const b = nodeArray[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy + 0.01;
          const dist = Math.sqrt(dist2);
          const repulse = (25 * alpha) / dist2; // Reduced force
          dx /= dist;
          dy /= dist;
          a.vx += dx * repulse;
          a.vy += dy * repulse;
          b.vx -= dx * repulse;
          b.vy -= dy * repulse;
        }
      }
    }

    linkArray.forEach((link) => {
      const sourceNode = nodeArray.find((node) => node.id === link.source);
      const targetNode = nodeArray.find((node) => node.id === link.target);
      if (!sourceNode || !targetNode) return;
      let dx = targetNode.x - sourceNode.x;
      let dy = targetNode.y - sourceNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const desired = 70 + (link.weight * 3); // Slightly tighter layout
      const diff = dist - desired;
      const k = 0.025 * alpha; // Slightly stronger spring force
      const fx = (dx / dist) * diff * k;
      const fy = (dy / dist) * diff * k;
      sourceNode.vx += fx;
      sourceNode.vy += fy;
      targetNode.vx -= fx;
      targetNode.vy -= fy;
    });

    const cx = width / 2;
    const cy = height / 2;
    nodeArray.forEach((node) => {
      node.vx += (cx - node.x) * 0.002 * alpha; // Slightly stronger centering
      node.vy += (cy - node.y) * 0.002 * alpha;
      node.vx *= 0.92; // Slightly stronger damping
      node.vy *= 0.92;
      node.x += node.vx;
      node.y += node.vy;
    });

    alpha = Math.max(0, alpha - alphaDecay * 0.03); // Faster decay
    alphaRef.current = alpha;

    frameCounterRef.current += 1;
    if (frameCounterRef.current % 8 === 0) {
      setTick((t) => t + 1);
    }

    frameRef.current = requestAnimationFrame(() => step());
  }, [layout, width, height]);

  useEffect(() => {
    if (layout === 'force') {
      initializeForceLayout();
      if (!frameRef.current && !disabled) {
        frameRef.current = requestAnimationFrame(() => step());
      }

      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        alphaRef.current = 0;
      };
    }

    initializeStaticLayout();
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      alphaRef.current = 0;
    };
  }, [initializeForceLayout, initializeStaticLayout, layout, disabled, step]);

  const panResponder = useMemo(() => {
    if (layout !== 'force' || disabled) {
      return undefined;
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent as any;
        const hit = nodesRef.current.find(
          (node) => (locationX - node.x) ** 2 + (locationY - node.y) ** 2 <= 16 * 16
        );
        if (hit) {
          draggingRef.current = hit;
          hit.vx = 0;
          hit.vy = 0;
        }
      },
      onPanResponderMove: (evt) => {
        if (!draggingRef.current) return;
        const { locationX, locationY } = evt.nativeEvent as any;
        draggingRef.current.x = Math.max(0, Math.min(width, locationX));
        draggingRef.current.y = Math.max(0, Math.min(height, locationY));
        draggingRef.current.vx = 0;
        draggingRef.current.vy = 0;
        setTick((t) => t + 1);
      },
      onPanResponderRelease: () => {
        draggingRef.current = null;
      },
      onPanResponderTerminate: () => {
        draggingRef.current = null;
      },
    });
  }, [layout, disabled, width, height]);

  return {
    nodes: nodesRef.current,
    links: linksRef.current,
    tick,
    panHandlers: panResponder?.panHandlers,
  };
};
