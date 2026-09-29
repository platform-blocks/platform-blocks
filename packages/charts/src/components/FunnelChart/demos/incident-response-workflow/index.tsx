import { FunnelChart, formatCompactNumber } from '@platform-blocks/charts';

import { INCIDENT_RESPONSE, IncidentMeta } from './data';

export function Demo() {
  return (
    <FunnelChart
      title="Incident response workflow"
      subtitle="Volume flowing through each stage"
      maw={520}
      h={460}
      series={INCIDENT_RESPONSE}
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
