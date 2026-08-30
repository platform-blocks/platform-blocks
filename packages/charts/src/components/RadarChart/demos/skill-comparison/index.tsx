import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Engineering guild comparison"
      subtitle="Quarterly capability radar"
      maxWidth={700}
      height={440}
      series={SERIES}
      maxValue={100}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      enableCrosshair
      multiTooltip
      liveTooltip
      legend={{ show: true, position: 'right', align: 'start' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${Math.round(point.value)}%`,
      }}
    />
  );
}
