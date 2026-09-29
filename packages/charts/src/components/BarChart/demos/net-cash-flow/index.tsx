import { BarChart } from '@platform-blocks/charts';

import { NET_CASH_FLOW } from './data';

export function Demo() {
  return (
    <BarChart
      title="Monthly net cash flow"
      subtitle="Diverging from zero: red months lost money, blue months made it"
      h={340}
      data={NET_CASH_FLOW}
      barSpacing={0.24}
      legend={{ show: false }}
      colorScale={{ type: 'diverging', midpoint: 0, colors: ['#e34948', '#2a78d6'] }}
      yAxis={{
        show: true,
        title: 'Net cash flow (USD thousands)',
        labelFormatter: (value) => `$${value}k`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      valueFormatter={(value) => `${value < 0 ? '-' : '+'}$${Math.abs(value)}k`}
    />
  );
}
