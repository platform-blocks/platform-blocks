import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
      <Text variant="h5">Heading 5</Text>
      <Text variant="h6">Heading 6</Text>
      <Text>The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="small">The quick brown fox jumps over the lazy dog.</Text>
    </Block>
  );
}
