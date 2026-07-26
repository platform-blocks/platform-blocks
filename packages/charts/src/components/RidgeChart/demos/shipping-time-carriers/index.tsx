import { RidgeChart } from '../../';

import { SERIES, formatDays } from './data';

export default function Demo() {
  return (
    <RidgeChart
      title="Shipping time distribution by carrier"
      subtitle="Parcel delivery performance across recent quarters"
      width={620}
      height={420}
      series={SERIES}
      samples={110}
      bandwidth={0.45}
      bandPadding={0.3}
      amplitudeScale={0.9}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Delivery time (days)',
        labelFormatter: (value) => formatDays(value as number),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
