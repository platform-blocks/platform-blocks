export const AXES = [
  'Code quality',
  'Delivery speed',
  'Testing coverage',
  'Observability',
  'Collaboration',
  'Innovation',
];

export const buildSeriesData = (values: number[]) =>
  AXES.map((axis, index) => ({ axis, value: values[index] }));

export const SERIES = [
  {
    id: 'frontend-guild',
    name: 'Frontend guild',
    showPoints: true,
    pointSize: 4,
    data: buildSeriesData([92, 84, 78, 86, 90, 74]),
  },
  {
    id: 'platform-guild',
    name: 'Platform guild',
    showPoints: true,
    pointSize: 4,
    data: buildSeriesData([88, 79, 91, 93, 82, 70]),
  },
  {
    id: 'qa-guild',
    name: 'QA guild',
    showPoints: true,
    pointSize: 4,
    data: buildSeriesData([80, 72, 95, 88, 76, 68]),
  },
];
