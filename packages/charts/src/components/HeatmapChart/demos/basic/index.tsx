import { HeatmapChart } from '@platform-blocks/charts';

import { DAYS, SESSIONS, UTILIZATION } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Support ticket load"
      subtitle="Average tickets per hour"
      height={320}
      data={{ rows: SESSIONS, cols: DAYS, values: UTILIZATION }}
      cellSize={{ width: 48, height: 44 }}
      gap={4}
      colorScale={{
        min: 0,
        max: 30,
        colors: ['#EBF4FF', '#60A5FA', '#1D4ED8'],
      }}
      xAxis={{
        show: true,
        title: 'Weekday',
      }}
      yAxis={{
        show: true,
        title: 'Shift',
      }}
      grid={{ show: false }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Low', color: '#EBF4FF' },
          { label: 'High', color: '#1D4ED8' },
        ],
      }}
      tooltip={{ show: true }}
    />
  );
}
