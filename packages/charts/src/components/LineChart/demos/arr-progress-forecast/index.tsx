import { LineChart } from '@platform-blocks/charts';

import { FORECAST_END, FORECAST_START, MONTH_LABELS, SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="ARR Progression vs. Forecast"
      subtitle="GTM regions actualized ARR with forward-looking plans"
      width={720}
      height={440}
      series={SERIES}
      smooth
      showPoints
      pointSize={5}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const month = MONTH_LABELS[Math.round(point.x)];
          const region = point.data?.region?.toUpperCase?.() ?? 'Region';
          const label = point.data?.type === 'forecast' ? 'Forecast' : 'Actual';
          return `${month} • ${region} ${label}: $${point.y.toFixed(0)}M ARR`;
        },
      }}
      annotations={[
        {
          id: 'forecast-window',
          shape: 'range',
          x1: FORECAST_START,
          x2: FORECAST_END,
          label: 'Forecast window',
          backgroundColor: '#2563eb1a',
          textColor: '#1f2937',
        },
      ]}
      xAxis={{
        show: true,
        title: 'Timeline',
        labelFormatter: (value: number) => MONTH_LABELS[Math.round(value)] ?? `M${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'ARR ($M)',
        labelFormatter: (value: number) => `$${Math.round(value)}M`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
