import { BarChart } from '@platform-blocks/charts';

import { HOURLY_REQUESTS } from './data';

export function Demo() {
  return (
    <BarChart
      title="API requests by hour"
      subtitle="One gradient spans the plot, so busier hours reach the deeper end"
      h={320}
      data={HOURLY_REQUESTS}
      barSpacing={0.28}
      legend={{ show: false }}
      barBorderRadius={6}
      barColor={{
        angle: 90,
        extent: 'plot',
        stops: [
          { offset: 0, color: '#12805a' },
          { offset: 1, color: '#8fdcbf' },
        ],
      }}
      yAxis={{
        show: true,
        title: 'Requests (millions)',
        labelFormatter: (value) => `${value}M`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      valueFormatter={(value) => `${value}M requests`}
    />
  );
}
