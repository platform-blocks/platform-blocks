import { ParetoChart } from '@platform-blocks/charts';

import { SUPPORT_CASES } from './data';

export function Demo() {
  return (
    <ParetoChart
      title="Support backlog concentration"
      subtitle="Top ten case drivers this quarter"
      height={440}
      data={SUPPORT_CASES}
      valueSeriesLabel="Cases"
      cumulativeSeriesLabel="Cumulative ticket share"
      yAxis={{ title: 'Case volume' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
