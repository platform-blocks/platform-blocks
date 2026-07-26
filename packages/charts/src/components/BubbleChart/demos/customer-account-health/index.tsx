import { BubbleChart } from '../../';

import { accounts } from './data';

const formatArr = (value: number) => `$${value.toFixed(2)}M ARR`;

export default function Demo() {
  return (
    <BubbleChart
      title="Customer Account Health vs Expansion"
      subtitle="Bubble size reflects current ARR; use upper-right quadrant to spot ready-to-expand logos"
      width={760}
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
