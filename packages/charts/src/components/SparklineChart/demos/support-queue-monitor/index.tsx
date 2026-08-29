import { View, Text } from 'react-native';
import { SparklineChart } from '@platform-blocks/charts';

import { QUEUE_DEPTH } from './data';

export function Demo() {
  const current = QUEUE_DEPTH[QUEUE_DEPTH.length - 1];
  const peak = Math.max(...QUEUE_DEPTH);

  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, width: 260 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Support Queue Length</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Current queue: {current} tickets · Peak today: {peak}
      </Text>

      <SparklineChart
        width={228}
        height={82}
        data={QUEUE_DEPTH}
        fill
        fillOpacity={0.14}
        smooth
        highlightLast
        highlightExtrema={{ showMin: false, showMax: true, color: '#6366F1', radius: 4.5, strokeColor: '#EEF2FF', strokeWidth: 1.5 }}
        thresholds={[{ value: 12, label: 'SLA ceiling', dashed: true, color: '#A5B4FC', opacity: 0.85, labelPosition: 'right' }]}
        bands={[{ from: 0, to: 8, color: '#C7D2FE', opacity: 0.18 }]}
        domain={{ y: [4, 18] }}
        animation={{ duration: 400, easing: 'easeInOutCubic' }}
        valueFormatter={(value) => `${Math.round(value)} tickets`}
      />
    </View>
  );
}
