export const DAYS = Array.from({ length: 30 }, (_, index) => `Day ${index + 1}`);

export const INCIDENT_COUNT = [
  28, 26, 32, 34, 30, 28, 25, 33, 38, 44,
  41, 36, 34, 39, 42, 48, 62, 71, 56, 44,
  38, 34, 31, 28, 32, 36, 40, 37, 33, 30,
];

export const mapSeries = (values: number[]) =>
  values.map((value, index) => ({
    x: index,
    y: value,
    data: { dayLabel: DAYS[index], value },
  }));

export const computeMovingAverage = (values: number[], window: number) => {
  const points: { x: number; y: number }[] = [];
  let rollingTotal = 0;
  for (let index = 0; index < values.length; index += 1) {
    rollingTotal += values[index];
    if (index >= window) {
      rollingTotal -= values[index - window];
    }
    if (index >= window - 1) {
      points.push({ x: index, y: +(rollingTotal / window).toFixed(2) });
    }
  }
  return points.map((point) => ({
    ...point,
    data: { dayLabel: DAYS[point.x], window },
  }));
};

export const SERIES = [
  {
    id: 'incidents',
    name: 'Daily Incidents',
    data: mapSeries(INCIDENT_COUNT),
    pointSize: 4,
  },
  {
    id: 'ma-7',
    name: '7-day Moving Average',
    lineStyle: 'dashed' as const,
    showPoints: false,
    data: computeMovingAverage(INCIDENT_COUNT, 7),
  },
  {
    id: 'ma-14',
    name: '14-day Moving Average',
    lineStyle: 'dotted' as const,
    showPoints: false,
    data: computeMovingAverage(INCIDENT_COUNT, 14),
  },
];

export const MAJOR_OUTAGE_DAY = 17;

export const STABILIZATION_START = 20.5;

export const STABILIZATION_END = 26.5;
