import { LineChart } from '@plocks/charts';

import { CONCURRENT_VIEWERS } from './data';

export function Demo() {
  return (
    <LineChart
      title="Concurrent viewers"
      subtitle="One gradient spans the plot: the evening peak reaches the deepest blue"
      h={320}
      data={CONCURRENT_VIEWERS}
      smooth
      fill
      showPoints={false}
      lineThickness={2.5}
      fillColor={{
        angle: 90,
        extent: 'plot',
        stops: [
          { offset: 0, color: '#1c5cab', opacity: 0.9 },
          { offset: 1, color: '#86b6ef', opacity: 0.12 },
        ],
      }}
      grid={{ show: true }}
      xAxis={{
        show: true,
        title: 'Hour',
        labelFormatter: (value) => `${String(Math.round(value)).padStart(2, '0')}:00`,
      }}
      yAxis={{
        show: true,
        title: 'Viewers (thousands)',
        labelFormatter: (value) => `${Math.round(value)}k`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.y}k viewers at ${String(point.x).padStart(2, '0')}:00`,
      }}
    />
  );
}
