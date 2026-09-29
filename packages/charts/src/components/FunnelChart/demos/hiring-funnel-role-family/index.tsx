import { FunnelChart, formatCompactNumber } from '@platform-blocks/charts';

import { HIRING_SERIES, HiringMeta, STEP_LOOKUP } from './data';

const findSeriesContext = (step: unknown) => STEP_LOOKUP.get(step as any) ?? null;

export function Demo() {
  return (
    <FunnelChart
      title="Hiring funnel — Staff engineer"
      subtitle="External candidates vs. internal transfers"
      maw={620}
      h={480}
      series={HIRING_SERIES}
      layout={{
        shape: 'bar',
        gap: 10,
        align: 'center',
        showConversion: false,
        seriesMode: 'grouped',
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
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
