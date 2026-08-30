import { RidgeChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Employee satisfaction score distribution"
      subtitle="Quarterly pulse survey responses by team"
      height={420}
      series={SERIES}
      samples={110}
      bandwidth={0.35}
      bandPadding={0.3}
      amplitudeScale={0.85}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Satisfaction score (1-5)',
        labelFormatter: (value) => (value as number).toFixed(1),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
