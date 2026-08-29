import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Product capability vs. competition"
      subtitle="Benchmarking core differentiators"
      width={620}
      height={460}
      series={SERIES}
      maxValue={10}
      fill
      enableCrosshair
      legend={{ show: true, position: 'bottom', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        showAxes: true,
        axisLabelPlacement: 'outside',
        axisLabelOffset: 20,
        ringLabels: [
          'Baseline',
          'Market ready',
          'Parity',
          'Differentiated',
          'Category leader',
        ],
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 10`,
      }}
    />
  );
}
