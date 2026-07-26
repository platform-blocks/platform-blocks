export const AXES = [
  'Availability',
  'Latency',
  'NPS',
  'Feature velocity',
  'Security posture',
  'Cost efficiency',
];

export const makeSeriesData = (values: number[]) =>
  AXES.map((axis, index) => ({ axis, value: values[index] }));

export const SERIES = [
  {
    id: 'current-health',
    name: 'Current health',
    showPoints: true,
    pointSize: 3,
    data: makeSeriesData([8.4, 7.2, 6.8, 7.5, 8.8, 6.2]),
  },
  {
    id: 'target-health',
    name: 'Target health',
    showPoints: true,
    pointSize: 3,
    data: makeSeriesData([9.2, 8.6, 8.1, 8.5, 9.0, 7.5]),
  },
];
