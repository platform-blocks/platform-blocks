import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Product health radar"
      subtitle="Operational score vs. strategic goal"
      width={580}
      height={440}
      series={SERIES}
      maxValue={10}
      radialGrid={{ rings: 4, shape: 'circle', showAxes: false }}
      enableCrosshair
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value.toFixed(1)} / 10`,
      }}
    />
  );
}
