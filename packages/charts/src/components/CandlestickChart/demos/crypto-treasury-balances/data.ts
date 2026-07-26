export type TreasuryCandle = {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  note?: string;
};

export const TREASURY_SERIES: TreasuryCandle[] = [
  { x: new Date('2024-05-06'), open: 42800, high: 44150, low: 42340, close: 43820, volume: 145 },
  { x: new Date('2024-05-13'), open: 43820, high: 44760, low: 43080, close: 43310, volume: 162, note: 'Sold 12 BTC to fund R&D' },
  { x: new Date('2024-05-20'), open: 43310, high: 44480, low: 42840, close: 44160, volume: 138 },
  { x: new Date('2024-05-27'), open: 44160, high: 45400, low: 43620, close: 45030, volume: 174 },
  { x: new Date('2024-06-03'), open: 45030, high: 46240, low: 44720, close: 45890, volume: 181 },
  { x: new Date('2024-06-10'), open: 45890, high: 47120, low: 45560, close: 46640, volume: 205, note: 'Derisked 8% into stablecoins' },
  { x: new Date('2024-06-17'), open: 46640, high: 47980, low: 46200, close: 47670, volume: 216 },
  { x: new Date('2024-06-24'), open: 47670, high: 48840, low: 46880, close: 47210, volume: 188 },
  { x: new Date('2024-07-01'), open: 47210, high: 48580, low: 46940, close: 48330, volume: 199 },
  { x: new Date('2024-07-08'), open: 48330, high: 49720, low: 47810, close: 49580, volume: 231 },
  { x: new Date('2024-07-15'), open: 49580, high: 50960, low: 48740, close: 49220, volume: 214 },
  { x: new Date('2024-07-22'), open: 49220, high: 50110, low: 48230, close: 48970, volume: 176, note: 'Compliance sign-off to rebalance' },
];

export const annotations = [
  {
    id: 'policy-shift',
    shape: 'vertical-line' as const,
    x: new Date('2024-06-10').getTime(),
    color: '#38bdf8',
    opacity: 0.65,
  },
  {
    id: 'risk-band',
    shape: 'horizontal-line' as const,
    y: 50000,
    color: '#f97316',
    opacity: 0.5,
  },
];
