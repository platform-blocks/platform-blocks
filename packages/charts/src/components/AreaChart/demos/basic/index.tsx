import { AreaChart } from '@platform-blocks/charts';

import { WEEKLY_SIGNUPS } from './data';

export function Demo() {
  return (
    <AreaChart
      title="Weekly signups"
      subtitle="Organic vs virality"
      width={360}
      height={240}
      data={WEEKLY_SIGNUPS}
      xAxis={{
        show: true,
        labelFormatter: (value: number) => `Week ${value + 1}`,
      }}
      yAxis={{
        show: true,
        labelFormatter: (value: number) => `${value} users`,
      }}
      grid={{ show: true, style: 'dashed' }}
      tooltip={{ show: true }}
      enableCrosshair
      liveTooltip
    />
  );
}
