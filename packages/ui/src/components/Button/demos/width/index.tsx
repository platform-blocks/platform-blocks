import { Block, Button } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Button>Default width</Button>
      <Button w={200}>Fixed width (200)</Button>
      <Button w="50%">Half width (50%)</Button>
      <Button fullWidth>Full width</Button>
    </Block>
  );
}
