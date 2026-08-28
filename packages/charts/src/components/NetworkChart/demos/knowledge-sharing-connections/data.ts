import type { NetworkLink, NetworkNode } from '@platform-blocks/charts';

export const TEAMS: NetworkNode[] = [
  { id: 'design-guild', name: 'Design Guild', group: 'product', value: 36 },
  { id: 'frontend', name: 'Frontend', group: 'engineering', value: 52 },
  { id: 'backend', name: 'Platform API', group: 'engineering', value: 58 },
  { id: 'data-science', name: 'Data Science', group: 'analytics', value: 41 },
  { id: 'product-management', name: 'Product Management', group: 'product', value: 47 },
  { id: 'customer-success', name: 'Customer Success', group: 'go-to-market', value: 33 },
  { id: 'devrel', name: 'DevRel', group: 'growth', value: 26 },
];

export const MENTORSHIPS: NetworkLink[] = [
  { source: 'frontend', target: 'design-guild', weight: 6.5, meta: { type: 'cross-team' } },
  { source: 'backend', target: 'frontend', weight: 7.2, meta: { type: 'pairing' } },
  { source: 'backend', target: 'data-science', weight: 4.1, meta: { type: 'cross-team' } },
  { source: 'product-management', target: 'design-guild', weight: 5.4, meta: { type: 'program' } },
  { source: 'product-management', target: 'customer-success', weight: 3.7, meta: { type: 'rotation' } },
  { source: 'devrel', target: 'frontend', weight: 2.9, meta: { type: 'cross-team' } },
  { source: 'devrel', target: 'customer-success', weight: 3.4, meta: { type: 'program' } },
  { source: 'data-science', target: 'product-management', weight: 4.6, meta: { type: 'pairing' } },
  { source: 'customer-success', target: 'design-guild', weight: 2.7, meta: { type: 'rotation' } },
];
