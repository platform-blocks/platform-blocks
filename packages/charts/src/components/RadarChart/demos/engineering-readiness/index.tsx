import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Engineering readiness radar"
      subtitle="Security, reliability, scalability, performance, maintainability"
      maw={600}
      h={440}
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
