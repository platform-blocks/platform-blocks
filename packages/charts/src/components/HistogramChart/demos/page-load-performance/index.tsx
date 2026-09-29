import { useState } from 'react';
import { View, Text } from 'react-native';
import { HistogramChart, HistogramBinSummary } from '@platform-blocks/charts';

import { BREACH_LIMIT, LOAD_TIMES, SLO_TARGET } from './data';

export function Demo() {
  const [focusedBin, setFocusedBin] = useState<HistogramBinSummary | null>(null);

  return (
  <View>
      <HistogramChart
        title="Page load time distribution"
        subtitle="Bins colored by SLO status"
        h={340}
        data={LOAD_TIMES}
        bins={14}
        density={false}
        showDensity={false}
        barOpacity={0.9}
        colorScale={{
          type: 'threshold',
          by: 'x',
          thresholds: [SLO_TARGET, BREACH_LIMIT],
          colors: ['#0ca30c', '#fab219', '#d03b3b'],
          labels: ['Within SLO', 'At risk', 'Breaching'],
        }}
        legend={{ show: true }}
        annotations={[
          {
            id: 'slo-target',
            shape: 'vertical-line',
            x: SLO_TARGET,
            color: '#71717A',
            label: 'SLO 2.5s',
          },
        ]}
        xAxis={{
          title: 'Page load time (seconds)',
          labelFormatter: (value) => `${value.toFixed(1)}s`,
        }}
        yAxis={{
          title: 'Page views',
        }}
        grid={{ show: true }}
        tooltip={{
          show: true,
          formatter: (bin) => `${bin.count} page views between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)}s`,
        }}
        valueFormatter={(count) => `${count} views`}
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
