export const DAYS = 180;

export const createCohort = (base: number, amplitude: number, lift: number) =>
  Array.from({ length: DAYS }, (_, day) => {
    const seasonal = Math.sin(day / 12) * amplitude;
    const adoption = Math.max(0, Math.sin((day - 36) / 28)) * lift;
    const engagementCycle = Math.cos(day / 3.6) * amplitude * 0.18;
    const trend = (day / DAYS) * lift * 0.45;
    const value = base + seasonal + adoption + engagementCycle + trend;
    return Math.max(120, Math.round(value));
  });

export const formatUsers = (value: number) => `${Math.round(value).toLocaleString()} users`;

export const userDensityTooltip = ({ value, density, series }: any) => {
  const median = series?.stats?.median;
  const medianLabel = median != null ? ` • median ${Math.round(median).toLocaleString()} users` : '';
  return `${Math.round(value).toLocaleString()} users • density ${(density * 100).toFixed(1)}%${medianLabel}`;
};

export const SERIES = [
  {
    id: 'core-product',
    name: 'Core product cohort',
    values: createCohort(420, 48, 96),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'collaboration-suite',
    name: 'Collaboration suite',
    values: createCohort(360, 42, 78),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'automation',
    name: 'Automation workflows',
    values: createCohort(260, 36, 64),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'ai-features',
    name: 'AI assistant features',
    values: createCohort(180, 34, 72),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'mobile-experience',
    name: 'Mobile experience',
    values: createCohort(220, 32, 58),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
];

export const formatThousands = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
