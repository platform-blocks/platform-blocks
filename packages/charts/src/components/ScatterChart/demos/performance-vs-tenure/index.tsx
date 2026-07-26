import { ScatterChart } from '../../';

import { SERIES } from './data';

export default function Demo() {
  return (
    <ScatterChart
      title="Performance rating vs. tenure"
      subtitle="Team-by-team view with marker size scaled to total compensation (USD thousands)"
      width={560}
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      pointOpacity={0.88}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Tenure (years)',
        labelFormatter: (value: number) => `${value.toFixed(1)} yrs`,
      }}
      yAxis={{
        show: true,
        title: 'Performance rating (1-5)',
        labelFormatter: (value: number) => value.toFixed(1),
      }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const compensation = point.data?.compensation;
          const compensationText = typeof compensation === 'number' ? `$${compensation}k` : 'n/a';
          return `${point.label ?? 'Team member'}\nRating ${point.y.toFixed(1)} | Tenure ${point.x.toFixed(1)} yrs\nComp ${compensationText}`;
        },
      }}
    />
  );
}
