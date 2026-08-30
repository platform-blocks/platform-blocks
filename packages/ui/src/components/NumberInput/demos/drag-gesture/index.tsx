import { useState } from 'react';

import { Block, NumberInput, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [horizontalValue, setHorizontalValue] = useState<number | undefined>(32);
  const [verticalValue, setVerticalValue] = useState<number | undefined>(120);
  const [dragging, setDragging] = useState(false);

  const handleDragStateChange = (state: boolean) => {
    setDragging(state);
  };

  return (
    <Block>
      <Text weight="semibold">Press-and-drag adjustment</Text>
      <Text size="sm" color="secondary">
        Drag across the input to nudge values without lifting your pointer. The status below reflects the current drag state.
      </Text>
      <Text size="xs" color={dragging ? 'primary' : 'secondary'}>
        Dragging: {dragging ? 'active' : 'idle'}
      </Text>

      <Block>
        <Block>
          <Text size="sm" weight="semibold">
            Horizontal drag
          </Text>
          <Text size="sm" color="secondary">
            Step every 14px drag movement with a multiplier for faster adjustments.
          </Text>
          <NumberInput
            label="Temperature"
            value={horizontalValue}
            onChange={setHorizontalValue}
            withDragGesture
            dragAxis="horizontal"
            dragStepDistance={14}
            dragStepMultiplier={2}
            step={1}
            allowDecimal={false}
            min={0}
            suffix=" °C"
            onDragStateChange={handleDragStateChange}
          />
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Vertical drag
          </Text>
          <Text size="sm" color="secondary">
            Drag up or down to adjust between 0 and 200 with built-in controls.
          </Text>
          <NumberInput
            label="Light intensity"
            value={verticalValue}
            onChange={setVerticalValue}
            withDragGesture
            dragAxis="vertical"
            dragStepDistance={18}
            step={5}
            allowDecimal={false}
            min={0}
            max={200}
            withControls
            hideControlsOnMobile={false}
            onDragStateChange={handleDragStateChange}
          />
        </Block>
      </Block>
    </Block>
  );
}
