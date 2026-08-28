import type { NetworkLink, NetworkNode } from '@platform-blocks/charts';

export const SERVICES: NetworkNode[] = [
  { id: 'api-gateway', name: 'API Gateway', group: 'edge', value: 420 },
  { id: 'auth-service', name: 'Auth', group: 'core', value: 260 },
  { id: 'catalog-service', name: 'Catalog', group: 'core', value: 310 },
  { id: 'payment-service', name: 'Payments', group: 'revenue', value: 280 },
  { id: 'notification-service', name: 'Notifications', group: 'engagement', value: 190 },
  { id: 'search-service', name: 'Search', group: 'experience', value: 240 },
  { id: 'analytics-service', name: 'Analytics', group: 'insights', value: 210 },
  { id: 'inventory-service', name: 'Inventory', group: 'ops', value: 330 },
];

export const DEPENDENCIES: NetworkLink[] = [
  { source: 'api-gateway', target: 'auth-service', weight: 9.5, meta: { latency: 95 } },
  { source: 'api-gateway', target: 'catalog-service', weight: 8.2, meta: { latency: 132 } },
  { source: 'api-gateway', target: 'payment-service', weight: 7.1, meta: { latency: 214 } },
  { source: 'catalog-service', target: 'inventory-service', weight: 6.4, meta: { latency: 186 } },
  { source: 'catalog-service', target: 'search-service', weight: 5.5, meta: { latency: 158 } },
  { source: 'payment-service', target: 'auth-service', weight: 4.2, meta: { latency: 248 } },
  { source: 'payment-service', target: 'analytics-service', weight: 3.6, meta: { latency: 276 } },
  { source: 'notification-service', target: 'api-gateway', weight: 4.4, meta: { latency: 146 } },
  { source: 'analytics-service', target: 'notification-service', weight: 3.2, meta: { latency: 182 } },
  { source: 'analytics-service', target: 'catalog-service', weight: 2.8, meta: { latency: 224 } },
];
