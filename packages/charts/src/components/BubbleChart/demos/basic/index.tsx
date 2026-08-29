import { BubbleChart } from '@platform-blocks/charts';

import { companies } from './data';

export function Demo() {
  return (
    <BubbleChart
      title="Revenue vs Growth"
      subtitle="Bubble size shows valuation (in millions)"
      width={520}
      height={360}
      data={companies}
      dataKey={{
        x: 'revenue',
        y: 'growth',
        z: 'valuation',
        label: 'company',
        id: 'company',
      }}
      xAxis={{
        title: 'Annual revenue (USD millions)',
        labelFormatter: (value) => `${Math.round(value)}m`,
      }}
      yAxis={{
        title: 'YoY growth %',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      valueFormatter={(value) => `$${Math.round(value)}m`}
      grid={{ show: true }}
      withTooltip
      range={[64, 1152]}
    />
  );
}
