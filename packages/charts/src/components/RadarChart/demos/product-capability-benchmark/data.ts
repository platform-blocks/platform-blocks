export const AXES = [
  { axis: 'ai', label: 'AI Assist' },
  { axis: 'integrations', label: 'Integration\nEcosystem' },
  { axis: 'analytics', label: 'Analytics\nDepth' },
  { axis: 'scale', label: 'Enterprise\nScalability' },
  { axis: 'security', label: 'Security\n& Compliance' },
  { axis: 'ux', label: 'User\nExperience' },
];

export const buildSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value.toFixed(1)} / 10`,
    };
  });

export const SERIES = [
  {
    id: 'ours',
    name: 'Our platform',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([8.4, 7.8, 8.9, 8.7, 9.4, 8.6]),
  },
  {
    id: 'competitor-a',
    name: 'Competitor Alpha',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([7.6, 8.4, 8.1, 8.2, 8.9, 7.5]),
  },
  {
    id: 'competitor-b',
    name: 'Competitor Beta',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([6.8, 7.4, 7.5, 7.9, 8.1, 6.9]),
  },
];
