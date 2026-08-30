import { RidgeChart } from '@platform-blocks/charts';

import { SERIES, formatThousands } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Daily active users across feature cohorts"
      subtitle="Distribution of session counts over the last six months"
      height={480}
      series={SERIES}
      samples={128}
      bandwidth={18}
      bandPadding={0.32}
      amplitudeScale={0.95}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Daily active users',
        labelFormatter: (value) => formatThousands.format(Math.round(value as number)),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
