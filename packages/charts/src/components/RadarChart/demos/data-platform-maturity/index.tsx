import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Data platform maturity"
      subtitle="Governance and enablement dimensions"
      width={620}
      height={480}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'bottom', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 24,
        ringLabels: [
          'Ad hoc',
          'Emerging',
          'Defined',
          'Managed',
          'Optimized',
        ],
        ringLabelPosition: 'outside',
        ringLabelOffset: 16,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 5`,
      }}
    />
  );
}
