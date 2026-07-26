export const AXES = ['Security', 'Reliability', 'Scalability', 'Performance', 'Maintainability'];

export const createSeries = (values: number[]) =>
  AXES.map((axis, index) => {
    const value = values[index];
    return {
      axis,
      value,
      formattedValue: `${value.toFixed(1)} / 5`,
    };
  });

export const SERIES = [
  {
    id: 'current',
    name: 'Current posture',
    showPoints: true,
    pointSize: 4,
    data: createSeries([2.6, 3.1, 2.8, 3.4, 2.9]),
  },
  {
    id: 'target',
    name: 'Target readiness',
    showPoints: true,
    pointSize: 4,
    data: createSeries([4.2, 4.4, 4.1, 4.3, 4.0]),
  },
];
