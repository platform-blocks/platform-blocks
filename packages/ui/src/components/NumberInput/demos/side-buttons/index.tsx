import { useMemo, useState } from 'react';

import { Block, NumberInput, Row, Text } from '@platform-blocks/react-ui-library';

const EnhancedNumberInput = NumberInput as any;

export function Demo() {
  const [value, setValue] = useState(32);
  const [step, setStep] = useState(1);
  const effectiveStep = useMemo(() => step || 1, [step]);

  return (
    <Block style={{ maxWidth: 360 }}>
      <Text weight="semibold">Side buttons and shift multiplier</Text>
      <Text size="sm" color="secondary">
        Combine side buttons with the default controls to support coarse and fine adjustments.
      </Text>

      <Block>
        <EnhancedNumberInput
          label="Playback speed"
          value={value}
          min={0}
          max={200}
          step={effectiveStep}
          shiftMultiplier={10}
          suffix="%"
          withSideButtons
          withControls
          onChange={(next: number | undefined) => {
            if (typeof next === 'number') {
              setValue(next);
            }
          }}
        />
        <Row justify="space-between" align="center">
          <Text size="xs" color="secondary">
            Current speed: {value}%
          </Text>
          <Text size="xs" color="secondary">
            Shift-click = ±{effectiveStep * 10}
          </Text>
        </Row>
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          Adjust the base step
        </Text>
        <Text size="sm" color="secondary">
          Update the increment to see how the multiplier scales.
        </Text>
        <EnhancedNumberInput
          label="Base step"
          value={step}
          min={1}
          max={25}
          step={1}
          withSideButtons
          onChange={(next: number | undefined) => {
            if (typeof next === 'number') {
              setStep(next);
            }
          }}
        />
      </Block>
    </Block>
  );
}
