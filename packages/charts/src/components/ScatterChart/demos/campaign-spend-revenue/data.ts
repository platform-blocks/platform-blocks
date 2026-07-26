export const SERIES = [
  {
    id: 'paid-social',
    name: 'Paid social',
    pointSize: 8,
    data: [
  { id: 'social-lifestyle', x: 90, y: 210, size: 9.4, label: 'Lifestyle creatives' },
  { id: 'social-product', x: 78, y: 188, size: 8.9, label: 'Product video' },
  { id: 'social-lookalike', x: 112, y: 265, size: 10.2, label: 'Lookalike expansion' },
  { id: 'social-remarketing', x: 68, y: 160, size: 8.4, label: 'Retargeting carousel' },
  { id: 'social-brand', x: 82, y: 195, size: 9.1, label: 'Brand storytelling' },
    ],
  },
  {
    id: 'paid-search',
    name: 'Paid search',
    pointSize: 7.5,
    data: [
  { id: 'search-brand', x: 55, y: 148, size: 8.1, label: 'Brand keywords' },
  { id: 'search-competitor', x: 72, y: 168, size: 8.8, label: 'Competitor conquest' },
  { id: 'search-feature', x: 48, y: 118, size: 7.8, label: 'Feature launch' },
  { id: 'search-sku', x: 64, y: 152, size: 8.4, label: 'SKU breakout' },
  { id: 'search-automation', x: 60, y: 160, size: 8.2, label: 'Smart bidding' },
    ],
  },
  {
    id: 'display',
    name: 'Programmatic & display',
    pointSize: 7.5,
    data: [
  { id: 'display-ctv', x: 95, y: 205, size: 9.6, label: 'CTV extension' },
  { id: 'display-contextual', x: 74, y: 165, size: 8.7, label: 'Contextual placements' },
  { id: 'display-retarget', x: 88, y: 198, size: 9.3, label: 'High-intent retarget' },
  { id: 'display-prospect', x: 82, y: 170, size: 8.9, label: 'Prospecting bundle' },
  { id: 'display-awareness', x: 90, y: 162, size: 9.2, label: 'Awareness push' },
    ],
  },
];

export const QUADRANTS = {
  x: 80,
  y: 185,
  fills: {
    topLeft: 'rgba(12, 166, 120, 0.12)',
    topRight: 'rgba(66, 99, 235, 0.12)',
    bottomLeft: 'rgba(255, 163, 72, 0.08)',
    bottomRight: 'rgba(255, 107, 107, 0.12)',
  },
  fillOpacity: 1,
  lineColor: '#C0D6FF',
  lineWidth: 1,
  labels: {
    topLeft: 'High ROI champions',
    topRight: 'Scale candidates',
    bottomLeft: 'Creative tune-up',
    bottomRight: 'Pull back spend',
  },
  labelColor: '#1C1D21',
  labelFontSize: 11,
  labelOffset: 14,
};
