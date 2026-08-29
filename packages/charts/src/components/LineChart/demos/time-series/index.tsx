import { LineChart } from '@platform-blocks/charts';

import { SERIES, formatter } from './data';

export function Demo() {
  return (
    <LineChart
      title="Web analytics"
      subtitle="Sessions and goals over time"
      width={600}
      height={360}
      series={SERIES}
      xScaleType="time"
      enableCrosshair
      multiTooltip
      liveTooltip
      enablePanZoom
      enableBrushZoom
      zoomMode="x"
      minZoom={0.25}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      grid={{ show: true, style: 'dotted' }}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: (value) => formatter.format(new Date(value)),
      }}
      yAxis={{
        show: true,
        title: 'Count',
        labelFormatter: (value) => value.toLocaleString(),
      }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = formatter.format(new Date(point.x));
          return `${label}: ${point.y.toLocaleString()} ${point.id === 'goal-completions' ? 'goals' : 'sessions'}`;
        },
      }}
      annotations={[
        {
          id: 'holiday-campaign',
          shape: 'range',
          x1: Date.UTC(2024, 10, 1),
          x2: Date.UTC(2024, 11, 31),
          label: 'Holiday campaign',
          color: '#0EA5E9',
          backgroundColor: 'rgba(14,165,233,0.12)',
        },
      ]}
    />
  );
}
