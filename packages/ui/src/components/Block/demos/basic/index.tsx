import { Block, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block w="100%" maxW={420}>
      <Block bg="#111827" radius="lg" p="lg">
        <Block>
          <Text weight="semibold" color="white">
            Release summary
          </Text>
          <Text size="sm" color="rgba(255,255,255,0.75)">
            Apply `bg`, `p`, and `radius` props on `Block` to build a card without custom stylesheets.
          </Text>
        </Block>
      </Block>

      <Block direction="row">
        <Block grow bg="#2563eb" radius="md" p="md">
          <Text weight="semibold" color="white">
            Velocity
          </Text>
          <Text size="sm" color="rgba(255,255,255,0.8)">
            Use `grow` so sibling Blocks share remaining space.
          </Text>
        </Block>
        <Block w={140} bg="#f9fafb" radius="md" p="md">
          <Text weight="semibold">Backlog</Text>
          <Text size="sm" color="muted">
            Combine fixed widths with flexible layouts via the `w` prop.
          </Text>
        </Block>
      </Block>

      <Block direction="row">
        <Block component="button" bg="#2563eb" radius="md" px="lg" py="sm">
          <Text color="white" weight="semibold">
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
          <Text color="#2563eb" weight="semibold">
            View roadmap
          </Text>
        </Block>
      </Block>
    </Block>
  );
}