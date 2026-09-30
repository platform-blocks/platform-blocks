import { Block, Surface, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Surface level={0} padding="md" radius="lg" fullWidth>
      <Block>
        <Text size="sm">Level 0</Text>
        <Surface raised padding="md" radius="lg" fullWidth>
          <Block>
            <Text size="sm">Level 1</Text>
            <Surface raised padding="md" fullWidth>
              <Text size="sm">Level 2</Text>
            </Surface>
          </Block>
        </Surface>
      </Block>
    </Surface>
  );
}
