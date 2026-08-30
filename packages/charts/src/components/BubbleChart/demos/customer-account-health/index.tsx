import { BubbleChart } from '@platform-blocks/charts';

import { accounts } from './data';

const formatArr = (value: number) => `$${value.toFixed(2)}M ARR`;

export function Demo() {
  return (
    <BubbleChart
      title="Customer Account Health vs Expansion"
      subtitle="Bubble size reflects current ARR; use upper-right quadrant to spot ready-to-expand logos"
      height={440}
      data={accounts}
      dataKey={{
        x: 'healthScore',
        y: 'expansionPotential',
        z: 'arr',
        label: 'account',
        id: 'account',
      }}
      xAxis={{
        title: 'Account health score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Expansion potential score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      grid={{ show: true }}
      valueFormatter={(value) => formatArr(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          formatArr(value),
          `Segment: ${record.segment} • CSM: ${record.csOwner}`,
          `Last touch: ${record.lastTouch}`,
        ].join('\n'),
      }}
      range={[96, 1728]}
    />
  );
}
