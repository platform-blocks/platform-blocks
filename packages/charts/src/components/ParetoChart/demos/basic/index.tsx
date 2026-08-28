import { ParetoChart } from '@platform-blocks/charts';

import { DEFECT_BREAKDOWN } from './data';

export default function Demo() {
  return (
    <ParetoChart
      title="Monthly defect analysis"
      subtitle="Product QA triage"
      width={720}
      height={420}
      data={DEFECT_BREAKDOWN}
      valueSeriesLabel="Defects"
      cumulativeSeriesLabel="Cumulative impact"
      grid={{ show: true, style: 'dotted' }}
      legend={{ show: true, position: 'bottom' }}
      yAxis={{ title: 'Defects reported' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
