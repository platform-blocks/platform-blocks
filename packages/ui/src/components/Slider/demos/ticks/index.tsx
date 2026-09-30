import { Block, Slider } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Slider
        accessibilityLabel="Milestone"
        defaultValue={50}
        restrictToTicks
        ticks={[
          { value: 0, label: 'Min' },
          { value: 25 },
          { value: 50, label: 'Mid' },
          { value: 75 },
          { value: 100, label: 'Max' },
        ]}
      />
    </Block>
  );
}
