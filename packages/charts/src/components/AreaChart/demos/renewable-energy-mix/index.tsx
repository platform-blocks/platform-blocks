import { AreaChart } from '@plocks/charts';

import { MONTH_LABELS, RENEWABLE_SERIES } from './data';

const formatMonth = (index: number) => MONTH_LABELS[index] ?? `M${index + 1}`;

export function Demo() {
  return (
    <AreaChart
      layout="stacked"
      title="Renewable Energy Generation"
      subtitle="Utility-scale output by source"
      h={420}
      series={RENEWABLE_SERIES}
      smooth
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Month of 2025',
        labelFormatter: (value: number) => formatMonth(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Generation (GWh)',
        labelFormatter: (value: number) => `${Math.round(value)} GWh`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
