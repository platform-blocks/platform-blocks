import { Block, Button, Card, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Card p="lg" radius="lg" shadow="md" maw={320}>
      <Block>
        <Block>
          <Text variant="small" c="muted">
            Upcoming match
          </Text>
          <Text variant="h6">Falcons at Bears</Text>
        </Block>
        <Text c="muted">
          Kickoff is set for 7:30 PM with rain in the forecast. Review the lineup and
          travel logistics before departure.
        </Text>
        <Button size="sm" variant="filled">
          View itinerary
        </Button>
      </Block>
    </Card>
  );
}
