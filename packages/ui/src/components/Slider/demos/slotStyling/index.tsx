import { useState } from 'react';
import { Block, Slider, RangeSlider, Text } from '@platform-blocks/ui';

const milestoneTicks = [
  { value: 0, label: '0' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
];

const milestoneTicksWithHighlight = milestoneTicks.map((t) =>
  t.value === 50
    ? {
        ...t,
        // per-tick override wins over the global tickStyle / activeTickStyle
        style: {
          width: 4,
          height: 14,
          backgroundColor: '#facc15',
          borderRadius: 2,
          top: 11,
        },
      }
    : t,
);

export default function Demo() {
  const [a, setA] = useState(35);
  const [b, setB] = useState(60);
  const [c, setC] = useState(50);
  const [d, setD] = useState<[number, number]>([20, 80]);

  return (
    <Block>
      <Text weight="semibold">Slot styling</Text>

      <Block>
        <Text size="sm" colorVariant="muted">
          Track + thumb overrides — taller track, square thumb
        </Text>
        <Slider
          value={a}
          onChange={setA}
          trackStyle={{ height: 10, borderRadius: 2 }}
          activeTrackStyle={{ height: 10, borderRadius: 2 }}
          thumbStyle={{ borderRadius: 4, borderWidth: 0 }}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Branded thumb — gradient-style fill via solid color + shadow
        </Text>
        <Slider
          value={b}
          onChange={setB}
          activeTrackColor="#10b981"
          thumbStyle={{
            backgroundColor: '#0ea5e9',
            borderColor: '#0369a1',
            borderWidth: 2,
            shadowColor: '#0ea5e9',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Tick + label styling (`tickStyle`, `activeTickStyle`, `tickLabelProps`)
        </Text>
        <Slider
          value={c}
          onChange={setC}
          ticks={milestoneTicks}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 12, borderRadius: 1.5, top: 12 }}
          tickLabelProps={{ ff: 'monospace', size: 'xs', weight: '700' }}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Per-tick override — the tick at 50 is taller and yellow
        </Text>
        <Slider
          value={c}
          onChange={setC}
          ticks={milestoneTicksWithHighlight}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          tickLabelProps={{ size: 'xs' }}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          RangeSlider — same slot props work on both thumbs and the active band
        </Text>
        <RangeSlider
          value={d}
          onChange={setD}
          ticks={milestoneTicks}
          activeTrackColor="#a855f7"
          trackStyle={{ height: 8, borderRadius: 4 }}
          activeTrackStyle={{ height: 8, borderRadius: 4 }}
          thumbStyle={{ backgroundColor: '#a855f7', borderColor: '#7e22ce', borderWidth: 2 }}
          tickStyle={{ width: 2, height: 8, top: 14 }}
          activeTickStyle={{ width: 2, height: 8, top: 14, backgroundColor: '#a855f7' }}
          tickLabelProps={{ size: 'xs', colorVariant: 'muted' }}
          valueLabelAlwaysOn
          valueLabelProps={{ weight: '700', size: 'sm' }}
        />
      </Block>
    </Block>
  );
}
