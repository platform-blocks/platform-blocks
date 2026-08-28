import { ParetoChart } from '@platform-blocks/charts';

import { ACCOUNT_REVENUE } from './data';

export default function Demo() {
  return (
    <ParetoChart
      title="Annual revenue concentration"
      subtitle="Top enterprise accounts"
      width={780}
      height={460}
      data={ACCOUNT_REVENUE}
      valueSeriesLabel="ARR"
      cumulativeSeriesLabel="Cumulative revenue"
      lineColor="#F97316"
      yAxis={{
        title: 'Recurring revenue',
        labelFormatter: (value) => `$${(value / 1_000_000).toFixed(1)}M`,
      }}
      yAxisRight={{
        title: 'Revenue share',
      }}
    />
  );
}
