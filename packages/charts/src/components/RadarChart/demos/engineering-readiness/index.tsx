import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Engineering readiness radar"
      subtitle="Security, reliability, scalability, performance, maintainability"
      width={600}
      height={440}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      legend={{ show: true, position: 'bottom' }}
      radialGrid={{
        rings: 5,
        shape: 'circle',
        showAxes: true,
        axisLabelPlacement: 'outside',
        ringLabels: [
          'Reactive',
          'Developing',
          'Consistent',
          'Resilient',
          'Elite',
        ],
        ringLabelPosition: 'inside',
        ringLabelOffset: 18,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value.toFixed(1)} readiness`,
      }}
    />
  );
}
