import type { DonutChartDataPoint } from '@platform-blocks/charts';

export const REGION_HEADCOUNT: DonutChartDataPoint[] = [
  { id: 'na', label: 'North America', value: 1820 },
  { id: 'emea', label: 'EMEA', value: 1240 },
  { id: 'apac', label: 'APAC', value: 860 },
  { id: 'latam', label: 'LATAM', value: 480 },
];

export const WORK_STYLE: DonutChartDataPoint[] = [
  { id: 'remote', label: 'Remote', value: 2760, data: { kind: 'work-style' } },
  { id: 'onsite', label: 'Onsite', value: 1640, data: { kind: 'work-style' } },
];

export const remoteRatio = WORK_STYLE[0].value / (WORK_STYLE[0].value + WORK_STYLE[1].value);
