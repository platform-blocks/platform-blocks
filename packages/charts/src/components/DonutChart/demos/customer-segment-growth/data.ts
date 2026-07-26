import type { DonutChartDataPoint } from '../../';

export const ARR_SEGMENTS: DonutChartDataPoint[] = [
  { id: 'enterprise', label: 'Enterprise', value: 82, data: { metric: 'arr' } },
  { id: 'mid-market', label: 'Mid-Market', value: 54, data: { metric: 'arr' } },
  { id: 'smb', label: 'SMB', value: 36, data: { metric: 'arr' } },
  { id: 'self-serve', label: 'Self-Serve', value: 22, data: { metric: 'arr' } },
];

export const GROWTH_CONTRIBUTION: DonutChartDataPoint[] = [
  { id: 'enterprise', label: 'Enterprise', value: 34, data: { metric: 'growth' } },
  { id: 'mid-market', label: 'Mid-Market', value: 28, data: { metric: 'growth' } },
  { id: 'smb', label: 'SMB', value: 22, data: { metric: 'growth' } },
  { id: 'self-serve', label: 'Self-Serve', value: 16, data: { metric: 'growth' } },
];
