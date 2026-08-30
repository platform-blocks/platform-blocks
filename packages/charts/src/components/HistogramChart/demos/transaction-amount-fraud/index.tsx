import { HistogramChart } from '@platform-blocks/charts';

import { REVIEW_THRESHOLD, TRANSACTION_AMOUNTS } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Transaction amount distribution"
      subtitle="Identifying anomalous high-value purchases"
      height={320}
      data={TRANSACTION_AMOUNTS}
      bins={16}
      binMethod="fd"
      showDensity
      barOpacity={0.76}
      densityColor="#0EA5E9"
      rangeHighlights={[
        { id: 'high-risk-window', start: 900, end: 1400, color: '#EF4444', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'manual-review',
          shape: 'vertical-line',
          x: REVIEW_THRESHOLD,
          color: '#DC2626',
          label: 'Manual review starts',
        },
      ]}
      xAxis={{
        title: 'Transaction amount (USD)',
        labelFormatter: (value) => `$${value.toFixed(0)}`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(3),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} orders between $${bin.start.toFixed(0)}–$${bin.end.toFixed(0)}`,
      }}
      valueFormatter={(count, bin) => `${count} orders · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
