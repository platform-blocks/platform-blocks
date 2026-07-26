import { Block, Code, H3, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Text weight="semibold">ff (font family) shorthand</Text>

      <Block>
        <Text size="sm" colorVariant="muted">Default theme font (no override)</Text>
        <Text>The quick brown fox jumps over the lazy dog</Text>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">ff="monospace"</Text>
        <Text ff="monospace">The quick brown fox jumps over the lazy dog</Text>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">ff="Georgia, serif" — also works on Title aliases</Text>
        <H3 ff="Georgia, serif">Heading in Georgia</H3>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          fontFamily still works (ff takes precedence when both are set)
        </Text>
        <Text fontFamily="Courier New">Inline using `fontFamily` — long form</Text>
        <Text ff="Georgia" fontFamily="Courier New">
          Both set: `ff="Georgia"` wins
        </Text>
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">Inline Code/Kbd inherit ff too</Text>
        <Text>
          Press <Code ff="ui-monospace, monospace">cmd+k</Code> to open spotlight
        </Text>
      </Block>
    </Block>
  );
}
