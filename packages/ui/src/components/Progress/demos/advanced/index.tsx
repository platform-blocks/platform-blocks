import { Block, Progress } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Progress value={100} striped animate />
    </Block>
  );
}
