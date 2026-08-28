import { HistogramChart } from '@platform-blocks/charts';

import { CONTRACT_LENGTHS, median } from './data';

export default function Demo() {
  return (
    <HistogramChart
      title="Customer contract length distribution"
      subtitle="Used to calibrate retention and renewal strategy"
      width={540}
      height={320}
      data={CONTRACT_LENGTHS}
      bins={12}
      binMethod="sturges"
      density={false}
      showDensity={false}
      barOpacity={0.82}
      rangeHighlights={[{ id: 'core-subscription', start: 12, end: 24, color: '#22C55E', opacity: 0.14 }]}
      annotations={[
        {
          id: 'one-year',
          shape: 'vertical-line',
          x: 12,
          color: '#22C55E',
          label: '1 year',
        },
        {
          id: 'two-year',
          shape: 'vertical-line',
          x: 24,
          color: '#15803D',
          label: '2 years',
        },
        {
          id: 'median',
          shape: 'vertical-line',
          x: median,
          color: '#F97316',
          label: `Median ${median} mo`,
        },
      ]}
      xAxis={{
        title: 'Contract length (months)',
      }}
      yAxis={{
        title: 'Customer accounts',
        labelFormatter: (value) => `${value.toFixed(0)}`,
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} accounts between ${bin.start.toFixed(0)}–${bin.end.toFixed(0)} months`,
      }}
      valueFormatter={(count) => `${count} customers`}
    />
  );
}
