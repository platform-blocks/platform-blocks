import { HistogramChart } from '@platform-blocks/charts';

import { RESPONSE_HOURS } from './data';

const ACCENT = '#199e70';

export function Demo() {
  return (
    <HistogramChart
      title="Support first-response time"
      subtitle="Outlined bars: a faint fill under a solid stroke"
      h={320}
      data={RESPONSE_HOURS}
      bins={12}
      barColor={ACCENT}
      barOpacity={0.18}
      barStroke={ACCENT}
      barStrokeWidth={1.5}
      barRadius={6}
      barGap={0.16}
      showDensity
      densityColor={ACCENT}
      densityThickness={2}
      xAxis={{
        title: 'Hours to first response',
        labelFormatter: (value) => `${value.toFixed(0)}h`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} tickets answered in ${bin.start.toFixed(1)}–${bin.end.toFixed(1)}h`,
      }}
      valueFormatter={(count) => `${count} tickets`}
    />
  );
}
