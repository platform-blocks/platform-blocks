import { LineChart } from '@platform-blocks/charts';

import { COOLING_SEASON, MONTHS, PORTFOLIO_TARGET, SERIES } from './data';

export default function Demo() {
  return (
    <LineChart
      title="Energy Consumption Across Office Portfolio"
      subtitle="Monthly MWh usage benchmarking against 360 MWh target"
      width={720}
      height={440}
      series={SERIES}
      smooth={false}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const month = point.data?.month ?? `Month ${point.x + 1}`;
          const building = point.data?.building ?? 'Site';
          return `${building} • ${month}: ${point.y.toFixed(0)} MWh`;
        },
      }}
      annotations={[
        {
          id: 'cooling-season',
          shape: 'range',
          x1: COOLING_SEASON.start,
          x2: COOLING_SEASON.end,
          label: 'Cooling season monitoring',
          backgroundColor: '#0ea5e91a',
          textColor: '#0C4A6E',
        },
        {
          id: 'target-line',
          shape: 'horizontal-line',
          y: PORTFOLIO_TARGET,
          label: 'Target 360 MWh',
          color: '#16A34A',
          textColor: '#14532D',
        },
        {
          id: 'retrofit-complete',
          shape: 'vertical-line',
          x: 3,
          label: 'LED retrofit complete',
          color: '#10B981',
          textColor: '#064E3B',
        },
      ]}
      xAxis={{
        show: true,
        title: '2024 calendar',
        labelFormatter: (value: number) => MONTHS[Math.round(value)] ?? `M${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Energy consumed (MWh)',
        labelFormatter: (value: number) => `${Math.round(value)} MWh`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
