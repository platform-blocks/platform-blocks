import { BarChart } from '@platform-blocks/charts';

import { QUARTERLY_REVENUE } from './data';

export function Demo() {
  return (
    <BarChart
      title="Quarterly revenue"
      subtitle="North America"
      width={380}
      height={260}
      data={QUARTERLY_REVENUE}
      barSpacing={0.25}
      barBorderRadius={6}
      valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
      xAxis={{ show: true }}
      yAxis={{
        show: true,
        labelFormatter: (value) => `$${(value / 1000).toFixed(0)}k`,
      }}
      grid={{ show: true, style: 'dotted' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.category}: $${point.value.toLocaleString()}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
