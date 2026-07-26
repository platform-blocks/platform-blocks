import { RadarChart } from '../../';

import { SERIES } from './data';

export default function Demo() {
  return (
    <RadarChart
      title="Market perception signal"
      subtitle="Customer interview scorecard"
      width={700}
      height={460}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'right', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 18,
        ringLabels: ({ index }) => ['Poor', 'Fair', 'Good', 'Great', 'Exceptional'][index],
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 5`,
      }}
    />
  );
}
