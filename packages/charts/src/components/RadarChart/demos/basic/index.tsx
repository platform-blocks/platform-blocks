import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Team capability radar"
      width={560}
      height={380}
      series={SERIES}
      maxValue={60}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      smooth
      fill
      enableCrosshair
      multiTooltip
      liveTooltip
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value}`,
      }}
    />
  );
}
