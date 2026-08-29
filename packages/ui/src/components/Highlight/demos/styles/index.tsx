import { Highlight, Text, Block } from '@platform-blocks/ui';

const copy = 'You can switch the highlight color while keeping the default marker style.';

export function Demo() {
  return (
    <Block>
      <Text variant="h5">Highlight color</Text>
      <Highlight highlight="highlight" highlightColor="highlight">{copy}</Highlight>
      <Highlight highlight="color" highlightColor="teal">{copy}</Highlight>
      <Highlight highlight="marker" highlightColor="pink">{copy}</Highlight>
    </Block>
  );
}
