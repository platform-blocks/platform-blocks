import { Block, Surface, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Surface level={1} padding="md" radius="lg" fullWidth>
        <Text>Resting surface</Text>
      </Surface>
    </Block>
  );
}
