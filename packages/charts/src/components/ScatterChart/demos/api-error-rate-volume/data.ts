export const SERIES = [
  {
    id: 'core-apis',
    name: 'Core services',
    pointSize: 8,
    data: [
      { id: 'core-auth', x: 520, y: 2.9, label: 'Auth' },
      { id: 'core-catalog', x: 480, y: 2.6, label: 'Catalog' },
      { id: 'core-inventory', x: 410, y: 2.4, label: 'Inventory' },
      { id: 'core-profiles', x: 365, y: 2.1, label: 'Profiles' },
      { id: 'core-checkout', x: 445, y: 2.7, label: 'Checkout' },
    ],
  },
  {
    id: 'payment-apis',
    name: 'Payment services',
    pointSize: 8,
    data: [
      { id: 'pay-processing', x: 260, y: 4.1, label: 'Processor' },
      { id: 'pay-ledger', x: 195, y: 3.1, label: 'Ledger' },
      { id: 'pay-invoicing', x: 220, y: 3.6, label: 'Invoicing' },
      { id: 'pay-fx', x: 180, y: 3.4, label: 'FX gateway' },
      { id: 'pay-risk', x: 240, y: 3.9, label: 'Risk scoring' },
    ],
  },
  {
    id: 'edge-apis',
    name: 'Edge and experimental',
    pointSize: 7,
    data: [
      { id: 'edge-recos', x: 120, y: 4.2, label: 'Recommendations' },
      { id: 'edge-search', x: 95, y: 4.5, label: 'Search beta' },
      { id: 'edge-proto', x: 70, y: 3.9, label: 'Prototype API' },
      { id: 'edge-labs', x: 55, y: 3.6, label: 'Labs checkout' },
      { id: 'edge-content', x: 82, y: 4, label: 'Content sync' },
    ],
  },
];

export const QUADRANTS = {
  x: 180,
  y: 3.5,
  fills: {
    topLeft: 'rgba(255, 193, 7, 0.1)',
    topRight: 'rgba(255, 107, 107, 0.12)',
    bottomLeft: 'rgba(63, 142, 252, 0.08)',
    bottomRight: 'rgba(34, 197, 247, 0.08)',
  },
  fillOpacity: 1,
  lineColor: '#B0C4FE',
  lineWidth: 1,
  labels: {
    topLeft: 'High error - lower volume',
    topRight: 'Critical risk',
    bottomLeft: 'Monitor growth',
    bottomRight: 'Healthy scale',
  },
  labelColor: '#1F2933',
  labelFontSize: 11,
  labelOffset: 12,
};
