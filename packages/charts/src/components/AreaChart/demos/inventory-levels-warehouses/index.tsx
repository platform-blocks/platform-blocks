import { AreaChart } from '@platform-blocks/charts';

import { INVENTORY_SERIES, formatMonth } from './data';

export default function Demo() {
  return (
    <AreaChart
      title="Inventory Levels by Warehouse"
      subtitle="Safety stock adjustments across the first half"
      width={640}
      height={420}
      series={INVENTORY_SERIES}
      smooth={false}
      grid={{ show: true, style: 'solid' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = formatMonth(Math.round(point.x));
          return `${label} • ${point.data?.warehouse ?? 'Warehouse'}: ${Math.round(point.y)}k units`;
        },
      }}
      xAxis={{
        show: true,
        title: '2025 timeline',
        labelFormatter: (value: number) => formatMonth(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Inventory on hand (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
