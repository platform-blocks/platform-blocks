import { ViolinChart } from '@platform-blocks/charts';

import { EXPERIMENT_SERIES, STATS, VALUE_BANDS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Experiment metric deltas vs. control"
      subtitle="Percent change in weekly activation compared to holdout"
      width={720}
      height={460}
      series={EXPERIMENT_SERIES}
      samples={88}
      bandwidth={1.5}
      violinWidthRatio={0.68}
      statsMarkers={STATS}
      valueBands={VALUE_BANDS}
      yAxis={{
        title: 'Percent delta',
        labelFormatter: (value) => `${value.toFixed(1)}%`,
      }}
      xAxis={{ show: true, title: 'Variant cohorts' }}
    />
  );
}
