import { useState } from 'react';
import { Block, Knob } from '@platform-blocks/ui';
import { POSITION_COLORS } from './data';

// Twelve detents on a full circle. `max` is 12 rather than 11 so position 11 sits one step
// short of the top instead of overlapping position 0. Each detent carries its own
const POSITIONS = POSITION_COLORS.map((accentColor, index) => ({ value: index, accentColor }));

export default function Demo() {
  const [position, setPosition] = useState(3);

  return (
    <Block >
      <Knob
        value={position}
        onChange={setPosition}
        min={0}
        max={12}
        marks={POSITIONS}
        restrictToMarks
        appearance={{
          accentFromMarks: true,
          ticks: [
            {
              source: 'marks',
              shape: 'line',
              // Only the detent the arm is aimed at lights up. The default 'fill' would
              // instead light every tick from 0 up to the current position.
              activeMode: 'nearest',
              length: 14,
              width: 20,
              position: 'outer',
              inactiveColor: ({ mark }) => (mark?.accentColor ? `${mark.accentColor}44` : '#475569'),
            },
          ],
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val) + 1}` }}
      />
    </Block>
  );
}
