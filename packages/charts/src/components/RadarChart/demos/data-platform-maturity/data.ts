export const AXES = [
  { axis: 'governance', label: 'Data\nGovernance' },
  { axis: 'quality', label: 'Data\nQuality' },
  { axis: 'lineage', label: 'Lineage &\nCataloguing' },
  { axis: 'selfServe', label: 'Self-service\nEnablement' },
  { axis: 'automation', label: 'Automation &\nObservability' },
  { axis: 'culture', label: 'Culture &\nLiteracy' },
];

export const maturityLabel = (value: number) => {
  if (value >= 4.5) return 'Optimized';
  if (value >= 3.5) return 'Managed';
  if (value >= 2.5) return 'Defined';
  if (value >= 1.5) return 'Emerging';
  return 'Ad hoc';
};

export const assembleSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value.toFixed(1)} / 5`,
      tooltip: `${value.toFixed(1)} / 5 • ${maturityLabel(value)}`,
    };
  });

export const SERIES = [
  {
    id: 'current',
    name: 'Current state',
    showPoints: true,
    pointSize: 4,
    data: assembleSeries([2.3, 2.8, 2.2, 1.9, 2.5, 2.1]),
  },
  {
    id: 'target',
    name: 'Target FY24',
    showPoints: true,
    pointSize: 4,
    data: assembleSeries([3.6, 3.8, 3.4, 3.2, 3.5, 3.3]),
  },
  {
    id: 'leader',
    name: 'Industry leader benchmark',
    showPoints: true,
    pointSize: 4,
    data: assembleSeries([4.5, 4.6, 4.4, 4.2, 4.5, 4.3]),
  },
];
