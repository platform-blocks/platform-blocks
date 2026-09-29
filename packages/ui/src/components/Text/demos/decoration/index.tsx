import { Block, Italic, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <Text fs="italic">italic</Text>
      <Text td="underline">underline</Text>
      <Text td="line-through">line-through</Text>
      <Italic fs="normal">Italic, set upright</Italic>
    </Block>
  );
}
