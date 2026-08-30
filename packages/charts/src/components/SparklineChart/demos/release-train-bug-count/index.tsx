import { View, Text } from 'react-native';
import { SparklineChart } from '@platform-blocks/charts';

import { BUG_BACKLOG } from './data';

export function Demo() {
  const latest = BUG_BACKLOG[BUG_BACKLOG.length - 1];
  const peak = Math.max(...BUG_BACKLOG);

  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, width: 260 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Bugs per Release Train</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Spike highlighted at {peak} bugs · Latest train: {latest} open
      </Text>

      <SparklineChart
        height={86}
        data={BUG_BACKLOG}
        color="#F03E3E"
        fill
        fillOpacity={0.12}
        smooth
        highlightLast
        highlightExtrema={{ showMax: true, showMin: false, color: '#F03E3E', radius: 4.5, strokeColor: '#FEE2E2', strokeWidth: 1.5 }}
        thresholds={[{ value: 18, label: 'Notice threshold', color: '#F87171', dashed: true, opacity: 0.8, labelPosition: 'left' }]}
        domain={{ y: [8, 26] }}
        valueFormatter={(value) => `${Math.round(value)} bugs`}
      />
    </View>
  );
}
