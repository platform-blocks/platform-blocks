import { Block, Progress } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Progress.Root>
        <Progress.Section value={35} color="primary">
          <Progress.Label>Docs</Progress.Label>
        </Progress.Section>
        <Progress.Section value={28} color="success">
          <Progress.Label>Media</Progress.Label>
        </Progress.Section>
        <Progress.Section value={15} color="warning">
          <Progress.Label>Other</Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </Block>
  );
}
