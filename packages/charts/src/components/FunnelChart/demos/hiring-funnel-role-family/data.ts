export type HiringMeta = {
  medianDays?: number;
  topDeclineReason?: string;
};

export const EXTERNAL_CANDIDATES = [
  { label: 'Applied', value: 780, meta: { medianDays: 0 } as HiringMeta },
  { label: 'Screen', value: 420, meta: { medianDays: 3, topDeclineReason: 'Insufficient architecture depth' } as HiringMeta },
  { label: 'HM interview', value: 210, meta: { medianDays: 6, topDeclineReason: 'Product strategy alignment' } as HiringMeta },
  { label: 'Panel', value: 120, meta: { medianDays: 12, topDeclineReason: 'Leadership signal gaps' } as HiringMeta },
  { label: 'Offered', value: 48, meta: { medianDays: 18, topDeclineReason: 'Compensation delta' } as HiringMeta },
  { label: 'Accepted', value: 22, meta: { medianDays: 24 } as HiringMeta },
];

export const INTERNAL_TRANSFERS = [
  { label: 'Applied', value: 220, meta: { medianDays: 0 } as HiringMeta },
  { label: 'Screen', value: 188, meta: { medianDays: 2, topDeclineReason: 'Role scope mismatch' } as HiringMeta },
  { label: 'HM interview', value: 150, meta: { medianDays: 5, topDeclineReason: 'Org fit feedback' } as HiringMeta },
  { label: 'Panel', value: 110, meta: { medianDays: 9, topDeclineReason: 'Leadership depth' } as HiringMeta },
  { label: 'Offered', value: 72, meta: { medianDays: 14, topDeclineReason: 'Comp band negotiations' } as HiringMeta },
  { label: 'Accepted', value: 44, meta: { medianDays: 18 } as HiringMeta },
];

export const HIRING_SERIES = [
  {
    id: 'external-candidates',
    name: 'External candidates',
    steps: EXTERNAL_CANDIDATES,
  },
  {
    id: 'internal-transfers',
    name: 'Internal transfers',
    steps: INTERNAL_TRANSFERS,
  },
];

export const STEP_LOOKUP = new Map<any, { series: (typeof HIRING_SERIES)[number]; seriesIndex: number; stepIndex: number }>();
