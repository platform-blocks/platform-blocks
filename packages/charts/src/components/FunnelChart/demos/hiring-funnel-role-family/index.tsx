import { FunnelChart } from '../../';

import { HIRING_SERIES, HiringMeta, STEP_LOOKUP } from './data';

const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};

const findSeriesContext = (step: unknown) => STEP_LOOKUP.get(step as any) ?? null;

export default function Demo() {
  return (
    <FunnelChart
      title="Hiring funnel — Staff engineer"
      subtitle="External candidates vs. internal transfers"
      width={620}
      height={480}
      series={HIRING_SERIES}
      layout={{
        shape: 'bar',
        gap: 10,
        align: 'center',
        showConversion: false,
        seriesMode: 'grouped',
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
      tooltip={{
        show: true,
        formatter: (step) => {
          const lookup = findSeriesContext(step as any) ?? undefined;
          if (!lookup) {
            return `${step.label}: ${step.value.toLocaleString()} candidates`;
          }
          const series = lookup.series;
          const stepIndex = lookup.stepIndex;
          const previous = stepIndex > 0 ? series.steps[stepIndex - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as HiringMeta | undefined;
          return [
            `${step.label} • ${series.name}`,
            `${step.value.toLocaleString()} candidates`,
            previous ? `Drop: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Pipeline intake',
            meta?.medianDays != null ? `Median time in stage: ${meta.medianDays} days` : undefined,
            meta?.topDeclineReason ? `Top decline reason: ${meta.topDeclineReason}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
