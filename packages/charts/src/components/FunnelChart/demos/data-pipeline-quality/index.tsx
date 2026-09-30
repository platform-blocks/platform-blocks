import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { PIPELINE_QUALITY, PipelineMeta } from './data';

export function Demo() {
  return (
    <FunnelChart
      title="Data pipeline quality checks"
      subtitle="From ingestion to certified datasets"
      maw={520}
      h={440}
      series={PIPELINE_QUALITY}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const idx = PIPELINE_QUALITY.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = idx > 0 ? PIPELINE_QUALITY.steps[idx - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as PipelineMeta | undefined;
          return [
            step.label,
            `${step.value.toLocaleString()} rows`,
            previous ? `Filtered: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Ingestion baseline',
            meta?.note,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
