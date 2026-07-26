export const AXES = [
  { axis: 'ease', label: 'Ease of\nUse' },
  { axis: 'feature', label: 'Feature\nDepth' },
  { axis: 'innovation', label: 'Innovation\nStory' },
  { axis: 'trust', label: 'Trust &\nCredibility' },
  { axis: 'support', label: 'Support\nExperience' },
  { axis: 'value', label: 'Value for\nMoney' },
];

export const buildSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value.toFixed(1)} / 5`,
    };
  });

export const SERIES = [
  {
    id: 'customers',
    name: 'Existing customers',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([4.6, 4.1, 4.3, 4.4, 4.7, 4.2]),
  },
  {
    id: 'prospects',
    name: 'Active prospects',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([4.2, 3.8, 4.0, 4.1, 3.9, 4.0]),
  },
  {
    id: 'analysts',
    name: 'Industry analysts',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([4.4, 4.3, 4.5, 4.2, 4.0, 4.1]),
  },
];
