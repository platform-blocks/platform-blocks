export const NODES = [
  { id: 'corporate-budget', name: 'Corporate Budget' },
  { id: 'gtm', name: 'Go-to-Market' },
  { id: 'product', name: 'Product & Engineering' },
  { id: 'operations', name: 'Operations' },
  { id: 'paid-media', name: 'Paid Media' },
  { id: 'events', name: 'Events' },
  { id: 'product-investment', name: 'Product Investment' },
  { id: 'platform-modernization', name: 'Platform Modernization' },
  { id: 'customer-success', name: 'Customer Success' },
  { id: 'supply-chain', name: 'Supply Chain' },
];

export const LINKS = [
  { source: 'corporate-budget', target: 'gtm', value: 24 },
  { source: 'corporate-budget', target: 'product', value: 32 },
  { source: 'corporate-budget', target: 'operations', value: 18 },
  { source: 'gtm', target: 'paid-media', value: 12 },
  { source: 'gtm', target: 'events', value: 8 },
  { source: 'gtm', target: 'customer-success', value: 4 },
  { source: 'product', target: 'product-investment', value: 14 },
  { source: 'product', target: 'platform-modernization', value: 12 },
  { source: 'operations', target: 'customer-success', value: 6 },
  { source: 'operations', target: 'supply-chain', value: 10 },
];
