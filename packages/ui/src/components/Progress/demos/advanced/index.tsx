import { Block, Progress } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Progress value={100} striped animate />
    </Block>
  );
}
