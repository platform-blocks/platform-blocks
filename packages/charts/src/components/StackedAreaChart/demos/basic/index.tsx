import { StackedAreaChart } from '../../';

import { SERIES } from './data';

export default function Demo() {
  return (
    <StackedAreaChart
      title="Active users by surface"
      subtitle="Monthly totals"
      width={560}
      height={340}
      series={SERIES}
      stackOrder="normal"
      opacity={0.65}
      xAxis={{ show: true, title: 'Month', labelFormatter: (value) => `M${value}` }}
      yAxis={{
        show: true,
        title: 'Active users (thousands)',
        labelFormatter: (value) => `${value}`,
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
