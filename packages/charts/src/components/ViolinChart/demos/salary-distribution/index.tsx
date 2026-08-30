import { ViolinChart } from '@platform-blocks/charts';

import { MARKET_RANGE, SALARY_SERIES, STATS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Total compensation distribution by department"
      subtitle="Annual salary including bonus (USD thousands)"
      height={480}
      series={SALARY_SERIES}
      samples={96}
      bandwidth={2.8}
      violinWidthRatio={0.74}
      statsMarkers={STATS}
      valueBands={MARKET_RANGE}
      yAxis={{
        title: 'Total compensation (k$)',
        labelFormatter: (value) => `$${value.toFixed(0)}k`,
      }}
    />
  );
}
