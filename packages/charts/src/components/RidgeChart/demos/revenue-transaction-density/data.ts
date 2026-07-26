export const SAMPLE_POINTS = 180;

export const createRevenueProfile = (base: number, amplitude: number, tail: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const seasonal = Math.sin(index / 9) * amplitude;
    const promotional = Math.max(0, Math.sin((index - 24) / 18)) * tail;
    const variability = Math.cos(index / 4.8) * amplitude * 0.22;
    const enterpriseTail = Math.pow(Math.sin((index + 18) / 48), 4) * tail * 1.4;
    const value = base + seasonal + promotional + variability + enterpriseTail;
    return Number(Math.max(12, value).toFixed(2));
  });

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number) => currencyFormatter.format(Math.max(0, Math.round(value)));

export const revenueTooltip = ({ value, density, series }: any) => {
  const p90 = series?.stats?.p90;
  const p90Label = p90 != null ? ` • p90 ${formatCurrency(p90)}` : '';
  return `${formatCurrency(value)} • density ${(density * 100).toFixed(1)}%${p90Label}`;
};

export const SERIES = [
  {
    id: 'starter',
    name: 'Starter tier',
    values: createRevenueProfile(45, 24, 62),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
  {
    id: 'growth',
    name: 'Growth tier',
    values: createRevenueProfile(68, 32, 74),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
  {
    id: 'enterprise',
    name: 'Enterprise contracts',
    values: createRevenueProfile(110, 42, 96),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
  {
    id: 'add-ons',
    name: 'Usage add-ons',
    values: createRevenueProfile(32, 20, 48),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
];
