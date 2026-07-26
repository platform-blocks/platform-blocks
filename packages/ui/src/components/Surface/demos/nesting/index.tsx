import { Block, Surface, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Surface level={0} padding="md" radius="lg" fullWidth>
      <Block>
        <Text size="sm" colorVariant="muted">
          Level 0 — the page
        </Text>
        <Surface raised padding="md" radius="lg" fullWidth>
          <Block>
            <Text size="sm">Raised once → level 1</Text>
            <Surface raised padding="md" radius="md" fullWidth>
              <Text size="sm">Raised again → level 2</Text>
            </Surface>
          </Block>
        </Surface>
      </Block>
    </Surface>
  );
}
