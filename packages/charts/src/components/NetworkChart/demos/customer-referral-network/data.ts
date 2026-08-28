import type { NetworkLink, NetworkNode } from '@platform-blocks/charts';

export const COHORTS: NetworkNode[] = [
  { id: 'seed-advocates', name: 'Seed Advocates', group: 'seed', value: 38 },
  { id: 'growth-us', name: 'Growth - US', group: 'growth', value: 44 },
  { id: 'growth-eu', name: 'Growth - EU', group: 'growth', value: 36 },
  { id: 'enterprise-wave', name: 'Enterprise Wave', group: 'enterprise', value: 29 },
  { id: 'partner-ecosystem', name: 'Partner Ecosystem', group: 'partners', value: 24 },
  { id: 'freemium-community', name: 'Freemium Community', group: 'seed', value: 50 },
  { id: 'latam-expansion', name: 'LATAM Expansion', group: 'growth', value: 31 },
];

export const REFERRALS: NetworkLink[] = [
  { source: 'seed-advocates', target: 'freemium-community', weight: 6.4, meta: { wave: 1 } },
  { source: 'seed-advocates', target: 'growth-us', weight: 4.7, meta: { wave: 1 } },
  { source: 'freemium-community', target: 'growth-eu', weight: 3.8, meta: { wave: 2 } },
  { source: 'growth-us', target: 'enterprise-wave', weight: 3.3, meta: { wave: 2 } },
  { source: 'growth-eu', target: 'enterprise-wave', weight: 2.6, meta: { wave: 3 } },
  { source: 'partner-ecosystem', target: 'enterprise-wave', weight: 3.9, meta: { wave: 1 } },
  { source: 'partner-ecosystem', target: 'growth-us', weight: 2.4, meta: { wave: 2 } },
  { source: 'latam-expansion', target: 'growth-eu', weight: 3.2, meta: { wave: 2 } },
  { source: 'latam-expansion', target: 'freemium-community', weight: 2.7, meta: { wave: 3 } },
];
