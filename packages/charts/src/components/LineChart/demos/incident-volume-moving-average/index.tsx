import { LineChart } from '@platform-blocks/charts';

import { DAYS, MAJOR_OUTAGE_DAY, SERIES, STABILIZATION_END, STABILIZATION_START } from './data';

export function Demo() {
  return (
    <LineChart
      title="Incident Volume with Moving Averages"
      subtitle="SRE daily incident intake and trailing trends"
      height={440}
      series={SERIES}
      smooth
      grid={{ show: true, style: 'solid' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = point.data?.window
            ? `${point.data.window}-day avg`
            : 'Incidents';
          const day = DAYS[Math.round(point.x)];
          return `${day} • ${label}: ${point.y.toFixed(1)} incidents`;
        },
      }}
      annotations={[
        {
          id: 'major-outage',
          shape: 'vertical-line',
          x: MAJOR_OUTAGE_DAY - 1,
          label: 'Major outage root cause',
          color: '#DC2626',
          textColor: '#0F172A',
        },
        {
          id: 'stabilization-window',
          shape: 'range',
          x1: STABILIZATION_START,
          x2: STABILIZATION_END,
          label: 'Stabilization playbook',
          backgroundColor: '#22c55e22',
          textColor: '#14532d',
        },
      ]}
      xAxis={{
        show: true,
        title: 'Rolling 30-day window',
        labelFormatter: (value: number) => DAYS[Math.round(value)] ?? `Day ${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Incident count',
        labelFormatter: (value: number) => `${Math.round(value)}`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
