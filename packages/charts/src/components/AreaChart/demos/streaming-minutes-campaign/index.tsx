import { AreaChart } from '@platform-blocks/charts';

import { STREAMING_SERIES, WEEK_TOTALS, formatWeek } from './data';

export default function Demo() {
  return (
    <AreaChart
      title="Streaming Minutes During Campaign"
      subtitle="Share of viewing time by content category"
      width={640}
      height={420}
      series={STREAMING_SERIES}
      layout="stackedPercentage"
      stackOrder="normal"
      areaOpacity={0.6}
      smooth
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const index = Math.round(point.x);
          const label = formatWeek(index);
          const minutes = point.data?.minutes ?? 0;
          const total = WEEK_TOTALS[index] ?? 0;
          const share = total > 0 ? (minutes / total) * 100 : 0;
          return `${label} • ${point.data?.category ?? 'Content'}: ${minutes}M min (${share.toFixed(1)}%)`;
        },
      }}
      xAxis={{
        show: true,
        title: 'Campaign cadence',
        labelFormatter: (value: number) => formatWeek(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Share of weekly minutes',
        labelFormatter: (value: number) => `${Math.round(value * 100)}%`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
