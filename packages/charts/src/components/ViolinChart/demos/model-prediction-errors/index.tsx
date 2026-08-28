import { ViolinChart } from '@platform-blocks/charts';

import { ERROR_SERIES, STATS, VALUE_BANDS } from './data';

export default function Demo() {
  return (
    <ViolinChart
      title="Prediction error distribution per model version"
      subtitle="Mean absolute error (percentage points) across validation folds"
      width={720}
      height={460}
      series={ERROR_SERIES}
      samples={96}
      bandwidth={0.9}
      violinWidthRatio={0.78}
      statsMarkers={STATS}
      valueBands={VALUE_BANDS}
      yAxis={{
        title: 'MAE (%)',
        labelFormatter: (value) => `${value.toFixed(2)}%`,
      }}
    />
  );
}
