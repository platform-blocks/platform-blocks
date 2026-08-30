import { ParetoChart } from '@platform-blocks/charts';

import { POSTMORTEM_CAUSES } from './data';

export function Demo() {
  return (
    <ParetoChart
      title="Incident root causes"
      subtitle="Rolling twelve months"
      height={420}
      data={POSTMORTEM_CAUSES}
      valueSeriesLabel="Incidents"
      cumulativeSeriesLabel="Cumulative impact"
      sortDirection="none"
      categoryLabelFormatter={(label) => label.replace(' ', '\n')}
      legend={{ show: true, position: 'right' }}
    />
  );
}
