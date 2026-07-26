export const SERIES = [
  {
    id: 'enterprise',
    name: 'Enterprise',
    pointSize: 10,
    data: [
      { id: 'ent-a', x: 185, y: 980, label: 'Enterprise A' },
      { id: 'ent-b', x: 172, y: 920, label: 'Enterprise B' },
      { id: 'ent-c', x: 194, y: 1040, label: 'Enterprise C' },
      { id: 'ent-d', x: 168, y: 905, label: 'Enterprise D' },
      { id: 'ent-e', x: 180, y: 965, label: 'Enterprise E' },
    ],
  },
  {
    id: 'mid-market',
    name: 'Mid-market',
    pointSize: 8,
    data: [
      { id: 'mid-a', x: 118, y: 640, label: 'Mid-market A' },
      { id: 'mid-b', x: 110, y: 590, label: 'Mid-market B' },
      { id: 'mid-c', x: 126, y: 705, label: 'Mid-market C' },
      { id: 'mid-d', x: 101, y: 565, label: 'Mid-market D' },
      { id: 'mid-e', x: 134, y: 720, label: 'Mid-market E' },
    ],
  },
  {
    id: 'smb',
    name: 'SMB',
    pointSize: 7,
    data: [
      { id: 'smb-a', x: 72, y: 355, label: 'SMB A' },
      { id: 'smb-b', x: 68, y: 330, label: 'SMB B' },
      { id: 'smb-c', x: 83, y: 410, label: 'SMB C' },
      { id: 'smb-d', x: 58, y: 295, label: 'SMB D' },
      { id: 'smb-e', x: 64, y: 325, label: 'SMB E' },
    ],
  },
];

export const QUADRANTS = {
  x: 110,
  y: 600,
  fills: {
    topLeft: 'rgba(32, 201, 151, 0.12)',
    topRight: 'rgba(76, 110, 245, 0.08)',
    bottomLeft: 'rgba(51, 154, 240, 0.08)',
    bottomRight: 'rgba(255, 107, 107, 0.1)',
  },
  fillOpacity: 1,
  lineColor: '#ADB5FF',
  lineWidth: 1,
  labels: {
    topLeft: 'High value - efficient CAC',
    topRight: 'High value - costly CAC',
    bottomLeft: 'Emerging opportunity',
    bottomRight: 'Reassess acquisition spend',
  },
  labelColor: '#1C1D21',
  labelFontSize: 11,
  labelOffset: 14,
};
