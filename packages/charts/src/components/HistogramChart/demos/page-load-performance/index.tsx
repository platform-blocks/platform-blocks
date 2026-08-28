import { useState } from 'react';
import { View, Text } from 'react-native';
import { HistogramChart, HistogramBinSummary } from '@platform-blocks/charts';

import { AVERAGE_LOAD, LOAD_TIMES, SLO_TARGET } from './data';

export default function Demo() {
  const [focusedBin, setFocusedBin] = useState<HistogramBinSummary | null>(null);

  return (
  <View>
      <HistogramChart
        title="Page load time distribution"
        subtitle="Week after performance optimization rollout"
        width={560}
        height={340}
        data={LOAD_TIMES}
        bins={14}
        binMethod="fd"
        showDensity
        densityThickness={3}
        barOpacity={0.78}
        densityColor="#12B886"
        rangeHighlights={[{ id: 'slo-window', start: 0, end: SLO_TARGET, color: '#38BDF8', opacity: 0.12 }]}
        annotations={[
          {
            id: 'slo-target',
            shape: 'vertical-line',
            x: SLO_TARGET,
            color: '#0EA5E9',
            label: 'SLO 2.5s',
          },
          {
            id: 'avg-load',
            shape: 'vertical-line',
            x: Number(AVERAGE_LOAD.toFixed(2)),
            color: '#F97316',
            label: `Avg ${AVERAGE_LOAD.toFixed(2)}s`,
          },
        ]}
        xAxis={{
          title: 'Page load time (seconds)',
          labelFormatter: (value) => `${value.toFixed(1)}s`,
        }}
        yAxis={{
          title: 'Probability density',
          labelFormatter: (value) => value.toFixed(2),
        }}
        grid={{ show: true }}
        tooltip={{
          show: true,
          formatter: (bin) => `${bin.count} page views between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)}s`,
        }}
        valueFormatter={(count, bin) => `${count} views · pdf ${bin.density.toFixed(3)}`}
        onBinFocus={(summary) => setFocusedBin(summary)}
        onBinBlur={() => setFocusedBin(null)}
      />
  <View style={{ paddingHorizontal: 4, marginTop: 12 }}>
        {focusedBin ? (
          <Text style={{ fontSize: 13, color: '#3F3F46' }}>
            {`${focusedBin.count} loads between ${focusedBin.start.toFixed(2)}–${focusedBin.end.toFixed(2)}s · percentile ${(focusedBin.percentile * 100).toFixed(1)}% · cumulative ${(focusedBin.cumulativeDensityRatio * 100).toFixed(1)}% density`}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: '#52525B' }}>
            Hover a bar to highlight its percentile and cumulative share of traffic.
          </Text>
        )}
      </View>
    </View>
  );
}
