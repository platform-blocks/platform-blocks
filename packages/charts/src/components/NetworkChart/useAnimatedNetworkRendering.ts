import { useMemo } from 'react';
import type { SimulationNode, SimulationLink } from './useNetworkSimulation';

interface UseAnimatedNetworkRenderingProps {
  nodes: SimulationNode[];
  links: SimulationLink[];
}

interface AnimatedLinkData {
  source: SimulationNode;
  target: SimulationNode;
  weight: number;
  index: number;
  color?: string;
  opacity?: number;
  width?: number;
  meta?: any;
  parallelIndex: number;
  parallelCount: number;
}

export const useAnimatedNetworkRendering = ({ nodes, links }: UseAnimatedNetworkRenderingProps) => {
  // The simulation already throttles ticks. Rendering must not wait for another
  // tick or animation frame: static and disabled layouts may never produce one.
  const renderLinks = useMemo(() => {
    const nodeMap = new Map<string, SimulationNode>();
    nodes.forEach((node) => nodeMap.set(node.id, node));

    const pairCounts = links.reduce<Map<string, number>>((acc, link) => {
      const key = `${link.source}|${link.target}`;
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map());

    const pairOffsets = new Map<string, number>();

    const processedLinks = links.reduce<AnimatedLinkData[]>((acc, link, index) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) {
        return acc;
      }

      const key = `${link.source}|${link.target}`;
      const total = pairCounts.get(key) ?? 1;
      const currentOffset = pairOffsets.get(key) ?? 0;
      pairOffsets.set(key, currentOffset + 1);

      acc.push({
        source,
        target,
        weight: link.weight,
        index,
        color: link.color,
        opacity: link.opacity,
        width: link.width,
        meta: link.meta,
        parallelIndex: currentOffset,
        parallelCount: total,
      });
      return acc;
    }, []);
    return processedLinks;
  }, [nodes, links]);

  return { renderNodes: nodes, renderLinks };
};
