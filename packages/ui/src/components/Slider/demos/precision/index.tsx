import { Block, Slider, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">step 0.01</Text>
        <Slider
          accessibilityLabel="Position"
          defaultValue={0.25}
          max={1}
          step={0.01}
          valueLabelAlwaysOn
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">step 0.5</Text>
        <Slider
          accessibilityLabel="Temperature"
          defaultValue={21.5}
          min={16}
          max={30}
          step={0.5}
          valueLabelAlwaysOn
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">precision 2</Text>
        <Slider
          accessibilityLabel="Ratio"
          defaultValue={0.5}
          max={1}
          step={0.1}
          precision={2}
          valueLabelAlwaysOn
        />
      </Block>
    </Block>
  );
}
