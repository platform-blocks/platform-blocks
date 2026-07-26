import { useState } from 'react';
import { Block, Knob } from '@platform-blocks/ui';

const ZONES = [
  { value: 60, color: '#22c55e' },
  { value: 25, color: '#f59e0b' },
  { value: 15, color: '#ef4444' },
];

export default function Demo() {
  const [load, setLoad] = useState(72);

  return (
    <Block align="center">
      <Knob
        value={load}
        onChange={setLoad}
        variant="minimal"
        max={100}
        appearance={{
          arc: { startAngle: -135, sweepAngle: 270 },
          ring: {  segments: ZONES, segmentMode: 'progress' },
          fill: { radiusOffset: -20 },
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val)}%` }}
      />
    </Block>
  );
}
