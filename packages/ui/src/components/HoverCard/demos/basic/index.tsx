import { Avatar, Block, Button, HoverCard, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <HoverCard
      target={
        <Button variant="subtle" size="sm">
          @platform-blocks
        </Button>
      }
    >
      <Block gap="xs" style={{ maxWidth: 240 }}>
        <Avatar
          fallback="PB"
          label="Platform Blocks"
          description="@platform-blocks"
          accessibilityLabel="Platform Blocks"
        />
        <Text size="sm" c="secondary">
          Cross-platform UI components for React Native and the web.
        </Text>
      </Block>
    </HoverCard>
  );
}
