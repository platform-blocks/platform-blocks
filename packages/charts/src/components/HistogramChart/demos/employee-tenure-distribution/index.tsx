import { HistogramChart } from '@platform-blocks/charts';

import { TENURE_YEARS, medianTenure } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Employee tenure distribution"
      subtitle="Shaded by headcount: bolder bins hold more people"
      h={320}
      data={TENURE_YEARS}
      bins={12}
      binMethod="sqrt"
      showDensity
      densityThickness={2.5}
      barOpacity={0.9}
      colorScale={{ type: 'sequential', by: 'count' }}
      annotations={[
        {
          id: 'median-tenure',
          shape: 'vertical-line',
          x: Number(medianTenure.toFixed(2)),
          color: '#71717A',
          label: `Median ${medianTenure.toFixed(1)} yrs`,
        },
      ]}
      xAxis={{
        title: 'Tenure (years)',
        labelFormatter: (value) => `${value.toFixed(1)} yrs`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} teammates between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)} years`,
      }}
      valueFormatter={(count, bin) => `${count} people · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
