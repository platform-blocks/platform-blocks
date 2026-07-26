export const SAMPLE_POINTS = 170;

export const createLatencyProfile = (base: number, jitter: number, tail: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const diurnal = Math.sin(index / 7) * jitter;
    const deployWave = Math.max(0, Math.sin((index - 28) / 16)) * tail;
    const background = Math.cos(index / 4.5) * jitter * 0.3;
    const heavyTail = Math.pow(Math.sin((index + 12) / 40), 6) * tail * 1.8;
    const value = base + diurnal + deployWave + background + heavyTail;
    return Number(Math.max(48, value).toFixed(1));
  });

export const formatLatency = (value: number) => `${Math.round(value)} ms`;

export const latencyTooltip = ({ value, density, series }: any) => {
  const p90 = series?.stats?.p90;
  const p90Label = p90 != null ? ` • p90 ${formatLatency(p90)}` : '';
  return `${formatLatency(value)} • density ${(density * 100).toFixed(1)}%${p90Label}`;
};

export const SERIES = [
  {
    id: 'projects',
    name: 'GET /projects',
    values: createLatencyProfile(210, 48, 160),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'reports',
    name: 'GET /reports',
    values: createLatencyProfile(260, 52, 210),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'ingest',
    name: 'POST /ingest',
    values: createLatencyProfile(340, 60, 280),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'search',
    name: 'GET /search',
    values: createLatencyProfile(180, 44, 150),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'billing',
    name: 'POST /billing',
    values: createLatencyProfile(400, 66, 320),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
];
