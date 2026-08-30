import { LineChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="Monthly active customers"
      subtitle="FY25"
      height={320}
      series={SERIES}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: (value) => `M${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Customers (thousands)',
        labelFormatter: (value) => `${value}`,
      }}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.y}k customers in month ${point.x}`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
      enablePanZoom
      zoomMode="x"
      minZoom={0.3}
    />
  );
}
