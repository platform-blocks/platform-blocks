import { AreaChart } from '@platform-blocks/charts';

import { PHASE_LABELS, SESSION_SERIES } from './data';

const formatPhase = (index: number) => PHASE_LABELS[index] ?? `Week ${index + 1}`;

export default function Demo() {
  return (
    <AreaChart
      title="Active Sessions During Launch"
      subtitle="Layered by device platform"
      width={640}
      height={420}
      series={SESSION_SERIES}
      smooth
      grid={{ show: true, style: 'solid' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      enableSeriesToggle
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = formatPhase(Math.round(point.x));
          const channel = point.data?.label ?? 'Sessions';
          return `${label} • ${channel}: ${Math.round(point.y)}k`;
        },
      }}
      xAxis={{
        show: true,
        title: 'Launch timeline',
        labelFormatter: (value: number) => formatPhase(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Daily sessions (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
