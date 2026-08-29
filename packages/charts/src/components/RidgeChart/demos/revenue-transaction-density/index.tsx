import { RidgeChart } from '@platform-blocks/charts';

import { SERIES, currencyFormatter } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Revenue per transaction by product line"
      subtitle="Transaction value distributions across seasonal cycles"
      width={640}
      height={440}
      series={SERIES}
      samples={128}
      bandwidth={14}
      bandPadding={0.28}
      amplitudeScale={0.9}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Revenue per transaction',
        labelFormatter: (value) => currencyFormatter.format(value as number),
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
