import { HeatmapChart } from '@platform-blocks/charts';

import { CLUSTERS, CPU_UTILIZATION, TIME_BLOCKS } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Infrastructure CPU utilization"
      subtitle="Average utilization (%) across compute clusters"
      width={760}
      height={360}
      data={{ rows: CLUSTERS, cols: TIME_BLOCKS, values: CPU_UTILIZATION }}
      cellSize={{ width: 90, height: 44 }}
      gap={6}
      colorScale={{
        min: 0,
        max: 100,
        stops: [
          { value: 35, color: '#0EA5E9' },
          { value: 60, color: '#FACC15' },
          { value: 80, color: '#F97316' },
          { value: 95, color: '#DC2626' },
        ],
      }}
      valueFormatter={({ value }) => `${Math.round(value)}% utilized`}
      showCellLabels={({ width, height }) => width >= 70 && height >= 38}
      xAxis={{ show: true, title: 'Time block' }}
      yAxis={{ show: true, title: 'Cluster' }}
    grid={{ show: true, style: 'dashed' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Healthy (< 60%)', color: '#0EA5E9' },
          { label: 'Watch (60-80%)', color: '#FACC15' },
          { label: 'Hotspot (> 80%)', color: '#F97316' },
        ],
      }}
      cellCornerRadius={6}
      hoverHighlight={{ rowOpacity: 0.16, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: false }}
    />
  );
}
