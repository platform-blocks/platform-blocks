import { Block, Button, HoverCard, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <HoverCard
      trigger="click"
      w={260}
      target={
        <Button variant="outline" size="sm">
          Show details
        </Button>
      }
    >
      <Block gap="xs">
        <Text fw="semibold">Deployment #482</Text>
        <Text size="sm" c="secondary">Built from main 4 minutes ago.</Text>
        <Button size="xs" variant="subtle">
          View logs
        </Button>
      </Block>
    </HoverCard>
  );
}
