import { LineChart } from '@platform-blocks/charts';

import { MONTHS, RELEASE_MARKERS, SERIES } from './data';

export default function Demo() {
  return (
    <LineChart
      title="NPS Trend with Product Releases"
      subtitle="Quarterly sentiment lift alongside major launches"
      width={640}
      height={420}
      series={SERIES}
      smooth
      fill
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const month = point.data?.month ?? `Month ${point.x + 1}`;
          return `${month} NPS: ${point.y.toFixed(0)}`;
        },
      }}
      annotations={[
        ...RELEASE_MARKERS.map((marker) => ({
          id: marker.id,
          shape: 'vertical-line' as const,
          x: marker.x,
          label: marker.label,
          color: '#6366F1',
          textColor: '#312E81',
          backgroundColor: '#E0E7FF',
        })),
        {
          id: 'nps-target',
          shape: 'horizontal-line',
          y: 55,
          label: 'Target 55 NPS',
          color: '#16A34A',
          textColor: '#0F172A',
        },
      ]}
      xAxis={{
        show: true,
        title: '2024 timeline',
        labelFormatter: (value: number) => MONTHS[Math.round(value)] ?? `M${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Net Promoter Score',
        labelFormatter: (value: number) => `${Math.round(value)}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
