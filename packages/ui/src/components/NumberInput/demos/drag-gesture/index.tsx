import { Block, NumberInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <NumberInput
        label="Horizontal drag"
        defaultValue={32}
        withDragGesture
        dragAxis="horizontal"
      />
      <NumberInput
        label="Vertical drag"
        defaultValue={120}
        withDragGesture
        dragAxis="vertical"
      />
    </Block>
  );
}
