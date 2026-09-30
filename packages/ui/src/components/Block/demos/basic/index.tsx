import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block w="100%" maw={420}>
      <Block bg="#111827" radius="lg" p="lg">
        <Text fw="semibold" c="white">
          Release summary
        </Text>
        <Text size="sm" c="rgba(255,255,255,0.75)">
          Version 2.4 is live in every region.
        </Text>
      </Block>

      <Block direction="row">
        <Block grow bg="#2563eb" radius="md" p="md">
          <Text fw="semibold" c="white">
            Velocity
          </Text>
          <Text size="sm" c="rgba(255,255,255,0.8)">
            42 points
          </Text>
        </Block>
        <Block w={140} bg="#f9fafb" radius="md" p="md">
          <Text fw="semibold">Backlog</Text>
          <Text size="sm" c="muted">
            18 items
          </Text>
        </Block>
      </Block>

      <Block direction="row">
        <Block component="button" bg="#2563eb" radius="md" px="lg" py="sm">
          <Text c="white" fw="semibold">
            Create project
          </Text>
        </Block>
        <Block
          component="button"
          radius="md"
          px="lg"
          py="sm"
          borderWidth={1}
          borderColor="#2563eb"
        >
          <Text c="#2563eb" fw="semibold">
            View roadmap
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
