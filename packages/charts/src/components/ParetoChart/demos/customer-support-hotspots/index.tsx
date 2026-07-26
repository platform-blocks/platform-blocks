import { ParetoChart } from '../../';

import { SUPPORT_CASES } from './data';

export default function Demo() {
  return (
    <ParetoChart
      title="Support backlog concentration"
      subtitle="Top ten case drivers this quarter"
      width={760}
      height={440}
      data={SUPPORT_CASES}
      valueSeriesLabel="Cases"
      cumulativeSeriesLabel="Cumulative ticket share"
      yAxis={{ title: 'Case volume' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
