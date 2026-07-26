export const NODES = [
  { id: 'crm', name: 'CRM' },
  { id: 'product-analytics', name: 'Product Analytics' },
  { id: 'billing', name: 'Billing' },
  { id: 'raw-zone', name: 'Raw Zone' },
  { id: 'staging', name: 'Staging' },
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'marts', name: 'Analytics Marts' },
  { id: 'dashboards', name: 'Executive Dashboards' },
  { id: 'cs-insights', name: 'CS Insights' },
  { id: 'ml-feature-store', name: 'ML Feature Store' },
];

export const LINKS = [
  { source: 'crm', target: 'raw-zone', value: 420 },
  { source: 'product-analytics', target: 'raw-zone', value: 360 },
  { source: 'billing', target: 'raw-zone', value: 280 },
  { source: 'raw-zone', target: 'staging', value: 900 },
  { source: 'staging', target: 'warehouse', value: 860 },
  { source: 'warehouse', target: 'marts', value: 540 },
  { source: 'warehouse', target: 'ml-feature-store', value: 320 },
  { source: 'marts', target: 'dashboards', value: 340 },
  { source: 'marts', target: 'cs-insights', value: 180 },
  { source: 'ml-feature-store', target: 'cs-insights', value: 120 },
];
