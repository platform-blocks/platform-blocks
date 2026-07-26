import type { NetworkLink, NetworkNode } from '../../types';

export const SYSTEMS: NetworkNode[] = [
  { id: 'edge-firewall', name: 'Edge Firewall', group: 'perimeter', value: 34 },
  { id: 'api-gateway', name: 'API Gateway', group: 'perimeter', value: 48 },
  { id: 'auth-service', name: 'Auth Service', group: 'identity', value: 62 },
  { id: 'service-mesh', name: 'Service Mesh', group: 'platform', value: 55 },
  { id: 'data-lake', name: 'Data Lake', group: 'data', value: 74 },
  { id: 'billing-system', name: 'Billing', group: 'finance', value: 80 },
  { id: 'support-portal', name: 'Support Portal', group: 'customer', value: 46 },
];

export const PROPAGATION: NetworkLink[] = [
  { source: 'edge-firewall', target: 'api-gateway', weight: 5.6, meta: { severity: 'major' } },
  { source: 'api-gateway', target: 'auth-service', weight: 4.2, meta: { severity: 'critical' } },
  { source: 'auth-service', target: 'service-mesh', weight: 3.5, meta: { severity: 'major' } },
  { source: 'service-mesh', target: 'data-lake', weight: 3.1, meta: { severity: 'critical' } },
  { source: 'data-lake', target: 'billing-system', weight: 2.8, meta: { severity: 'critical' } },
  { source: 'billing-system', target: 'support-portal', weight: 2.4, meta: { severity: 'major' } },
  { source: 'edge-firewall', target: 'support-portal', weight: 2.9, meta: { severity: 'minor' } },
  { source: 'service-mesh', target: 'support-portal', weight: 2.2, meta: { severity: 'minor' } },
];
