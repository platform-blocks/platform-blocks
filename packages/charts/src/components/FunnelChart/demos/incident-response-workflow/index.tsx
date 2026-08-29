import { FunnelChart } from '@platform-blocks/charts';

import { INCIDENT_RESPONSE, IncidentMeta } from './data';

const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};

export function Demo() {
  return (
    <FunnelChart
      title="Incident response workflow"
      subtitle="Volume flowing through each stage"
      width={520}
      height={460}
      series={INCIDENT_RESPONSE}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const idx = INCIDENT_RESPONSE.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = idx > 0 ? INCIDENT_RESPONSE.steps[idx - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as IncidentMeta | undefined;
          return [
            `${step.label}`,
            `${step.value.toLocaleString()} incidents`,
            meta?.medianDuration,
            previous ? `Drop since prior: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Start of workflow',
            meta?.automationWin ? `Automation impact: ${meta.automationWin}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
