import { LineChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="Revenue trajectory"
      subtitle="Smoothed forecast vs. actuals"
      width={560}
      height={320}
      series={SERIES}
      smooth
      fill
      showPoints={false}
      lineThickness={3}
      fillOpacity={0.28}
      enableCrosshair
      multiTooltip
      liveTooltip
      enablePanZoom
      zoomMode="x"
      minZoom={0.35}
      legend={{ show: true, position: 'top', align: 'center' }}
      grid={{ show: true, style: 'dashed' }}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: (value) => `M${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Revenue (USD thousands)',
        labelFormatter: (value) => `$${Math.round(value)}`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `$${point.y.toLocaleString()}k in month ${point.x}`,
      }}
      annotations={[
        {
          id: 'midyear-target',
          shape: 'vertical-line',
          x: 6,
          label: 'Mid-year target',
          color: '#6366F1',
          dashArray: [6, 6],
        },
      ]}
    />
  );
}
