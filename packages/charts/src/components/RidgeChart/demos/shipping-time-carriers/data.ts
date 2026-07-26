export const SAMPLE_POINTS = 150;

export const createShippingProfile = (base: number, variation: number, tail: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const seasonal = Math.sin(index / 8.5) * variation;
    const disruption = Math.max(0, Math.sin((index - 22) / 16)) * tail;
    const trafficNoise = Math.cos(index / 3.1) * variation * 0.26;
    const value = base + seasonal + disruption + trafficNoise;
    const clamped = Math.min(8.2, Math.max(1.1, value));
    return Number(clamped.toFixed(2));
  });

export const formatDays = (value: number) => `${value.toFixed(1)} days`;

export const shippingTooltip = ({ value, density, series }: any) => {
  const p90 = series?.stats?.p90;
  const p90Label = p90 != null ? ` • p90 ${formatDays(p90)}` : '';
  return `${formatDays(value)} • density ${(density * 100).toFixed(1)}%${p90Label}`;
};

export const SERIES = [
  {
    id: 'northstar',
    name: 'NorthStar Logistics',
    values: createShippingProfile(3.6, 0.55, 1.2),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
  {
    id: 'aero',
    name: 'Aero Freight',
    values: createShippingProfile(2.9, 0.5, 1.1),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
  {
    id: 'urban-express',
    name: 'Urban Express',
    values: createShippingProfile(2.4, 0.42, 0.9),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
  {
    id: 'coastal',
    name: 'Coastal Courier',
    values: createShippingProfile(4.2, 0.6, 1.4),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
];
