import type { NetworkLink, NetworkNode } from '@platform-blocks/charts';

export const suppliers = (
  [
    { id: 'supplier-a', name: 'Supplier A', value: 68 },
    { id: 'supplier-b', name: 'Supplier B', value: 54 },
    { id: 'supplier-c', name: 'Supplier C', value: 46 },
  ] satisfies Array<Omit<NetworkNode, 'group'>>
).map((node, index) => ({
  ...node,
  group: 'supplier',
  x: 0,
  y: index * 80,
}));

export const manufacturers = (
  [
    { id: 'plant-north', name: 'Plant - North', value: 82 },
    { id: 'plant-central', name: 'Plant - Central', value: 76 },
    { id: 'plant-south', name: 'Plant - South', value: 64 },
  ] satisfies Array<Omit<NetworkNode, 'group'>>
).map((node, index) => ({
  ...node,
  group: 'manufacturer',
  x: 1,
  y: index * 80 + 30,
}));

export const distribution = (
  [
    { id: 'dc-west', name: 'DC West', value: 58 },
    { id: 'dc-east', name: 'DC East', value: 72 },
    { id: 'dc-emea', name: 'DC EMEA', value: 49 },
  ] satisfies Array<Omit<NetworkNode, 'group'>>
).map((node, index) => ({
  ...node,
  group: 'distribution',
  x: 2,
  y: index * 80 + 10,
}));

export const NODES: NetworkNode[] = [...suppliers, ...manufacturers, ...distribution];

export const LINKS: NetworkLink[] = [
  { source: 'supplier-a', target: 'plant-north', weight: 6.4, meta: { risk: 'low' } },
  { source: 'supplier-a', target: 'plant-central', weight: 4.8, meta: { risk: 'medium' } },
  { source: 'supplier-b', target: 'plant-central', weight: 5.6, meta: { risk: 'medium' } },
  { source: 'supplier-b', target: 'plant-south', weight: 4.1, meta: { risk: 'high' } },
  { source: 'supplier-c', target: 'plant-north', weight: 3.9, meta: { risk: 'low' } },
  { source: 'supplier-c', target: 'plant-south', weight: 3.3, meta: { risk: 'medium' } },
  { source: 'plant-north', target: 'dc-west', weight: 5.2, meta: { risk: 'low' } },
  { source: 'plant-north', target: 'dc-emea', weight: 3.5, meta: { risk: 'medium' } },
  { source: 'plant-central', target: 'dc-west', weight: 4.4, meta: { risk: 'medium' } },
  { source: 'plant-central', target: 'dc-east', weight: 5.9, meta: { risk: 'low' } },
  { source: 'plant-south', target: 'dc-east', weight: 4.7, meta: { risk: 'medium' } },
  { source: 'plant-south', target: 'dc-emea', weight: 3.8, meta: { risk: 'high' } },
];
