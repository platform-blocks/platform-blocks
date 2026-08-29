import { BubbleChart } from '@platform-blocks/charts';

import { initiatives } from './data';

const formatMillions = (value: number) => `$${value.toFixed(1)}M`;

export function Demo() {
  return (
    <BubbleChart
      title="Product Initiative Portfolio"
      subtitle="Strategic value vs execution effort — bubble scales with projected revenue"
      width={760}
      height={440}
      data={initiatives}
      dataKey={{
        x: 'executionEffort',
        y: 'strategicValue',
        z: 'projectedRevenue',
        label: 'initiative',
        id: 'initiative',
      }}
      grid={{ show: true }}
      xAxis={{
        title: 'Execution effort (1=low, 10=high)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      yAxis={{
        title: 'Strategic value (1=low, 10=high)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      valueFormatter={(value) => formatMillions(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Projected revenue: ${formatMillions(value)}`,
          `Confidence: ${record.confidence}%`,
          `Owner: ${record.owner} • Horizon: ${record.horizon}`,
        ].join('\n'),
      }}
      range={[72, 1440]}
    />
  );
}
