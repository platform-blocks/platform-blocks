export type MrrCandle = {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  note?: string;
};

export const MRR_SERIES: MrrCandle[] = [
  { x: new Date('2024-02-01'), open: 182000, high: 185400, low: 180600, close: 184900, volume: 58 },
  { x: new Date('2024-03-01'), open: 184900, high: 188200, low: 183300, close: 186700, volume: 62 },
  { x: new Date('2024-04-01'), open: 186700, high: 192500, low: 184200, close: 191400, volume: 96, note: 'Expansion push launched' },
  { x: new Date('2024-05-01'), open: 191400, high: 196300, low: 188100, close: 193800, volume: 104 },
  { x: new Date('2024-06-01'), open: 193800, high: 197600, low: 192200, close: 194100, volume: 71 },
  { x: new Date('2024-07-01'), open: 194100, high: 199900, low: 191500, close: 198600, volume: 109 },
  { x: new Date('2024-08-01'), open: 198600, high: 203200, low: 196700, close: 202800, volume: 122, note: 'New usage-based plan introduced' },
  { x: new Date('2024-09-01'), open: 202800, high: 208400, low: 200200, close: 206100, volume: 118 },
  { x: new Date('2024-10-01'), open: 206100, high: 209900, low: 201800, close: 203300, volume: 84, note: 'Churn spike from legacy tiers' },
  { x: new Date('2024-11-01'), open: 203300, high: 210800, low: 202100, close: 209200, volume: 131 },
  { x: new Date('2024-12-01'), open: 209200, high: 216500, low: 207600, close: 214800, volume: 144 },
  { x: new Date('2025-01-01'), open: 214800, high: 221400, low: 213100, close: 219500, volume: 152 },
];

export const annotations = [
  {
    id: 'pricing-refresh',
    shape: 'vertical-line' as const,
    x: new Date('2024-08-01').getTime(),
    color: '#22c55e',
    opacity: 0.65,
  },
  {
    id: 'churn-band',
    shape: 'box' as const,
    x1: new Date('2024-09-01').getTime(),
    x2: new Date('2024-10-15').getTime(),
    y1: 208000,
    y2: 198000,
    color: '#f97316',
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
];
