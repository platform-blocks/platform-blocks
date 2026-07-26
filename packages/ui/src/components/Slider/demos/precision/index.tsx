import { useState } from 'react';
import { Block, Slider, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [position, setPosition] = useState(0.25);
  const [temp, setTemp] = useState(21.5);
  const [ratio, setRatio] = useState(0.5);

  return (
    <Block>
      <Block>
        <Text size="sm" colorVariant="muted">
          Fractional `step={0.01}` — decimals are inferred from the step
        </Text>
        <Slider
          value={position}
          onChange={setPosition}
          min={0}
          max={1}
          step={0.01}
          valueLabelAlwaysOn
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          `step={0.5}` — half steps
        </Text>
        <Slider
          value={temp}
          onChange={setTemp}
          min={16}
          max={30}
          step={0.5}
          valueLabelAlwaysOn
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Force decimals with `precision={2}` (independent of step)
        </Text>
        <Slider
          value={ratio}
          onChange={setRatio}
          min={0}
          max={1}
          step={0.1}
          precision={2}
          valueLabelAlwaysOn
        />
      </Block>
    </Block>
  );
}
