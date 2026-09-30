import { Avatar, Block, Button, HoverCard, Text } from '@plocks/ui';

export function Demo() {
  return (
    <HoverCard
      target={
        <Button variant="subtle" size="sm">
          @plocks
        </Button>
      }
    >
      <Block gap="xs" style={{ maxWidth: 240 }}>
        <Avatar
          fallback="PB"
          label="plocks"
          description="@plocks"
          accessibilityLabel="plocks"
        />
        <Text size="sm" c="secondary">
          Cross-platform UI components for React Native and the web.
        </Text>
      </Block>
    </HoverCard>
  );
}
