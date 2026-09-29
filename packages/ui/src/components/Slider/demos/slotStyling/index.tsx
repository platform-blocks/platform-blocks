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

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">Track and thumb</Text>
        <Slider
          accessibilityLabel="Track and thumb overrides"
          defaultValue={35}
          trackStyle={{ height: 10, borderRadius: 2 }}
          activeTrackStyle={{ height: 10, borderRadius: 2 }}
          thumbStyle={{ borderRadius: 4, borderWidth: 0 }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Ticks and tick labels</Text>
        <Slider
          accessibilityLabel="Tick styling"
          defaultValue={50}
          ticks={milestoneTicks}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 12, borderRadius: 1.5, top: 12 }}
          tickLabelProps={{ ff: 'monospace', size: 'xs', fw: '700' }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Per-tick style</Text>
        <Slider
          accessibilityLabel="Per-tick override"
          defaultValue={50}
          ticks={milestoneTicksWithHighlight}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          tickLabelProps={{ size: 'xs' }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">RangeSlider</Text>
        <RangeSlider
          accessibilityLabel="Range with slot styling"
          defaultValue={[20, 80]}
          ticks={milestoneTicks}
          activeTrackColor="#a855f7"
          trackStyle={{ height: 8, borderRadius: 4 }}
          activeTrackStyle={{ height: 8, borderRadius: 4 }}
          thumbStyle={{ backgroundColor: '#a855f7', borderColor: '#7e22ce', borderWidth: 2 }}
          tickStyle={{ width: 2, height: 8, top: 14 }}
          activeTickStyle={{ width: 2, height: 8, top: 14, backgroundColor: '#a855f7' }}
          tickLabelProps={{ size: 'xs', c: 'muted' }}
          valueLabelAlwaysOn
          valueLabelProps={{ fw: '700', size: 'sm' }}
        />
      </Block>
    </Block>
  );
}
