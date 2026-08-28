import { RadarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export default function Demo() {
  return (
    <RadarChart
      title="Role family skills gap analysis"
      subtitle="Percent attainment against competency targets"
      width={720}
      height={480}
      series={SERIES}
      maxValue={100}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'right', align: 'start' }}
      radialGrid={{
        rings: 4,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 24,
        ringLabels: ({ value }) => `${Math.round(value)} pts`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${Math.round(point.value)} / 100`,
      }}
    />
  );
}
