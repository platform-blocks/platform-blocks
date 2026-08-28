import { RidgeChart } from '@platform-blocks/charts';

import { SERIES, formatLatency } from './data';

export default function Demo() {
  return (
    <RidgeChart
      title="API latency distribution by endpoint"
      subtitle="Density of response times across rolling deployments"
      width={640}
      height={450}
      series={SERIES}
      samples={128}
      bandwidth={16}
      bandPadding={0.24}
      amplitudeScale={0.92}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Latency (ms)',
        labelFormatter: (value) => formatLatency(value as number),
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
