import { useMemo, useState } from 'react';

import { Block, Knob, Text } from '@platform-blocks/ui';

const TEMPERATURE_STOPS = [0, 25, 50, 75, 100];

export default function Demo() {
  const [level, setLevel] = useState(62);

  const status = useMemo(() => {
    if (level >= 85) return 'Critical';
    if (level >= 60) return 'Elevated';
    if (level >= 35) return 'Nominal';
    return 'Idle';
  }, [level]);

  return (
    <Block align="center">
      <Knob.Root
        min={0}
        max={100}
        value={level}
        onChange={setLevel}
        step={1}
        size={260}
        appearance={{
          arc: { startAngle: -120, sweepAngle: 240, clampInput: true },
          interaction: { spinStopAtLimits: true },
        }}
      >
        <Knob.Fill visible={false} />
        <Knob.Ring thickness={30} color="#0f172a" trailColor="#1f2937" radiusOffset={-4} />
        <Knob.RingSegment value={35} color="#1e3a8a" />
        <Knob.RingSegment value={25} color="#155e75" />
        <Knob.RingSegment value={25} color="#854d0e" />
        <Knob.RingSegment value={15} color="#7f1d1d" />
        <Knob.Progress
          mode="contiguous"
          thickness={14}
          color="#22d3ee"
          roundedCaps
        />
        <Knob.TickLayer
          source="values"
          values={TEMPERATURE_STOPS}
          shape="line"
          length={22}
          width={3}
          position="outer"
          radiusOffset={10}
          label={{
            show: true,
            formatter: (_, index) => `${TEMPERATURE_STOPS[index]}%`,
            offset: 24,
            style: { color: '#cbd5f5', fontSize: 12, fontWeight: '600' },
          }}
        />
        <Knob.Pointer length={90} width={4} color="#f8fafc" offset={-8} cap="round" />
        <Knob.Thumb visible={false} />
        <Knob.ValueLabel
          position="bottom"
          formatter={(value) => `${Math.round(value)}% capacity`}
          textStyle={{ fontSize: 18, fontWeight: '600', color: '#f8fafc' }}
          secondary={{
            formatter: () => status,
            position: 'bottom',
            textStyle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
          }}
        />
      </Knob.Root>
      <Text size="sm" colorVariant="secondary">
        Thermal headroom · {status}
      </Text>
    </Block>
  );
}
