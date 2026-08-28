import { HistogramChart } from '@platform-blocks/charts';

import { TENURE_YEARS, medianTenure } from './data';

export default function Demo() {
  return (
    <HistogramChart
      title="Employee tenure distribution"
      subtitle="Helps spot retention risks and succession depth"
      width={540}
      height={320}
      data={TENURE_YEARS}
      bins={12}
      binMethod="sqrt"
      showDensity
      densityThickness={2.5}
      densityColor="#22C55E"
      barOpacity={0.8}
      rangeHighlights={[
        { id: 'new-hires', start: 0, end: 1.5, color: '#FACC15', opacity: 0.18 },
        { id: 'veterans', start: 8, end: 15, color: '#22C55E', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'median-tenure',
          shape: 'vertical-line',
          x: Number(medianTenure.toFixed(2)),
          color: '#F97316',
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
