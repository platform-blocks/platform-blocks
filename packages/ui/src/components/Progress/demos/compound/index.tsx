import { Block, Progress, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block gap="lg">
      <Block gap="xs">
        <Text variant="small" colorVariant="muted">
          Sections with inline labels
        </Text>
        <Progress.Root size="xl">
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
        <Text variant="small" colorVariant="muted">
          Sections take a share of the track, so the remaining 22% stays unfilled.
        </Text>
      </Block>

      <Block gap="xs">
        <Text variant="small" colorVariant="muted">
          Striped and animated sections
        </Text>
        <Progress.Root size="lg" radius="xl">
          <Progress.Section value={45} color="primary" />
          <Progress.Section value={25} color="secondary" striped animate />
        </Progress.Root>
        <Text variant="small" colorVariant="muted">
          `striped` and `animate` work per section, marking in-flight work.
        </Text>
      </Block>
    </Block>
  );
}
