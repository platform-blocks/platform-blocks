import { useState } from 'react';

import { Block, Knob } from '@platform-blocks/ui';

const LEVEL_MARKS = [
  { value: 0, label: 'Mute' },
  { value: 25, label: 'Low' },
  { value: 50, label: 'Mid' },
  { value: 75, label: 'High' },
  { value: 100, label: 'Max' },
];

export function Demo() {
  const [level, setLevel] = useState(48);

  return (
    <Block align="center">
      <Knob
        value={level}
        onChange={setLevel}
        min={0}
        max={100}
        step={1}
        marks={LEVEL_MARKS}
        size={180}
        appearance={{
          // A full circle would put the 0 and 100 marks on the same point, overprinting
          // their labels; the 270deg arc gives each end of the scale its own position.
          arc: { startAngle: -135, sweepAngle: 270 },
          ring: { thickness: 16 },
          fill: { radiusOffset: -24 },
          progress: { mode: 'contiguous', color: '#f97316' },
          ticks: [
            // Two layers over the same dial: labelled lines from `marks`, and a finer
            // dot scale from an explicit step list underneath them.
            {
              source: 'marks',
              shape: 'line',
              length: 16,
              width: 3,
              position: 'outer',
              label: { show: true, position: 'outer' },
            },
            {
              source: 'steps',
              values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
              shape: 'dot',
              radiusOffset: -6,
              color: '#475569',
              inactiveColor: 'rgba(71, 85, 105, 0.4)',
            },
          ],
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val)}%` }}
      />
    </Block>
  );
}
