import { ScatterChart } from '../../';

import { SERIES } from './data';

export default function Demo() {
  return (
    <ScatterChart
      title="Feature usage vs. satisfaction"
      subtitle="Weekly feature interactions mapped to CSAT by cohort"
      width={560}
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      pointOpacity={0.85}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Weekly feature uses',
        labelFormatter: (value: number) => `${value}x`,
      }}
      yAxis={{
        show: true,
        title: 'Customer satisfaction (1-10)',
        labelFormatter: (value: number) => value.toFixed(1),
      }}
      tooltip={{
        show: true,
        formatter: (point) =>
          `${point.label ?? 'Cohort'}\nUsage ${point.x.toFixed(1)}x | CSAT ${point.y.toFixed(1)}`,
      }}
    />
  );
}
