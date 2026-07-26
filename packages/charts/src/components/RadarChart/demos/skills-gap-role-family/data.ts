export const AXES = [
  { axis: 'strategy', label: 'Product\nStrategy' },
  { axis: 'delivery', label: 'Delivery\nExecution' },
  { axis: 'customer', label: 'Customer\nInsight' },
  { axis: 'collaboration', label: 'Cross-team\nCollaboration' },
  { axis: 'quality', label: 'Quality &\nReliability' },
];

export const makeSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value} pts`,
    };
  });

export const SERIES = [
  {
    id: 'target',
    name: 'Target capability',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([92, 90, 95, 94, 93]),
  },
  {
    id: 'engineering',
    name: 'Engineering org',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([88, 82, 76, 84, 80]),
  },
  {
    id: 'product',
    name: 'Product org',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([86, 78, 90, 88, 82]),
  },
  {
    id: 'design',
    name: 'Design org',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([80, 70, 88, 90, 76]),
  },
];
