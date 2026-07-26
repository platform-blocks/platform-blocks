export const LITHIUM_SERIES = [
  { x: new Date('2024-09-02'), open: 36200, high: 37180, low: 35420, close: 36840 },
  { x: new Date('2024-09-09'), open: 36840, high: 37510, low: 36080, close: 37200 },
  { x: new Date('2024-09-16'), open: 37200, high: 37840, low: 36520, close: 36610 },
  { x: new Date('2024-09-23'), open: 36610, high: 36950, low: 35840, close: 36020 },
  { x: new Date('2024-09-30'), open: 36020, high: 36480, low: 35260, close: 35510 },
  { x: new Date('2024-10-07'), open: 35510, high: 36040, low: 34800, close: 35160 },
  { x: new Date('2024-10-14'), open: 35160, high: 35590, low: 34420, close: 34780 },
  { x: new Date('2024-10-21'), open: 34780, high: 35200, low: 34060, close: 34920 },
];

export const NICKEL_SERIES = [
  { x: new Date('2024-09-02'), open: 18940, high: 19480, low: 18620, close: 19260 },
  { x: new Date('2024-09-09'), open: 19260, high: 19850, low: 19010, close: 19530 },
  { x: new Date('2024-09-16'), open: 19530, high: 20040, low: 19300, close: 19780 },
  { x: new Date('2024-09-23'), open: 19780, high: 20360, low: 19420, close: 19890 },
  { x: new Date('2024-09-30'), open: 19890, high: 20540, low: 19610, close: 20330 },
  { x: new Date('2024-10-07'), open: 20330, high: 20810, low: 20060, close: 20210 },
  { x: new Date('2024-10-14'), open: 20210, high: 20640, low: 19880, close: 20140 },
  { x: new Date('2024-10-21'), open: 20140, high: 20520, low: 19710, close: 19940 },
];

export const negotiationMarkers = [
  {
    id: 'kickoff',
    shape: 'vertical-line' as const,
    x: new Date('2024-09-16').getTime(),
    color: '#f97316',
    opacity: 0.55,
  },
  {
    id: 'conclusion',
    shape: 'vertical-line' as const,
    x: new Date('2024-10-14').getTime(),
    color: '#0ea5e9',
    opacity: 0.55,
  },
];
