import { HistogramChart } from '@platform-blocks/charts';

import { DELIVERY_MINUTES } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Delivery time distribution"
      subtitle="One gradient spans the plot, so taller bins reach the deeper end"
      h={320}
      data={DELIVERY_MINUTES}
      bins={14}
      density={false}
      showDensity={false}
      barOpacity={1}
      barRadius={4}
      barColor={{
        angle: 90,
        extent: 'plot',
        stops: [
          { offset: 0, color: '#1c5cab' },
          { offset: 1, color: '#86b6ef' },
        ],
      }}
      xAxis={{
        title: 'Minutes from order to door',
        labelFormatter: (value) => `${value.toFixed(0)}m`,
      }}
      yAxis={{
        title: 'Orders',
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} orders in ${bin.start.toFixed(0)}–${bin.end.toFixed(0)} min`,
      }}
      valueFormatter={(count) => `${count} orders`}
    />
  );
}
