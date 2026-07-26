import { AreaChart } from '@platform-blocks/charts';

import { SEVERITY_SERIES, WEEKS } from './data';

const formatWeek = (index: number) => WEEKS[index] ?? `Week ${index + 1}`;

export default function Demo() {
  return (
    <AreaChart
      title="Quarterly Support Ticket Mix"
      subtitle="Stacked by severity level"
      width={640}
      height={420}
      series={SEVERITY_SERIES}
      layout="stacked"
      smooth
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Quarter timeline',
        labelFormatter: (value: number) => formatWeek(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Tickets created',
        labelFormatter: (value: number) => `${Math.round(value)}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
