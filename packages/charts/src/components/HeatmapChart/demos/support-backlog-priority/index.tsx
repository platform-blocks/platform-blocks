import { HeatmapChart } from '@platform-blocks/charts';

import { BACKLOG, MODULES, PRIORITIES } from './data';

export default function Demo() {
  return (
    <HeatmapChart
      title="Support backlog by module"
      subtitle="Open tickets by severity priority"
      width={700}
      height={360}
      data={{ rows: MODULES, cols: PRIORITIES, values: BACKLOG }}
      cellSize={{ width: 108, height: 48 }}
      gap={6}
      colorScale={{
        type: 'log',
        min: 1,
        max: 32,
        colors: ['#EFF6FF', '#60A5FA', '#1D4ED8'],
      }}
      valueFormatter={({ value }) => `${value} ${value === 1 ? 'ticket' : 'tickets'}`}
      showCellLabels={({ cell }) => cell.value >= 8}
      xAxis={{ show: true, title: 'Priority' }}
      yAxis={{ show: true, title: 'Product module' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Low volume', color: '#EFF6FF' },
          { label: 'Rising load', color: '#60A5FA' },
          { label: 'Critical backlog', color: '#1D4ED8' },
        ],
      }}
      cellCornerRadius={4}
      hoverHighlight={{ rowOpacity: 0.14, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: true }}
    />
  );
}
