import { Block, Button, Card, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Card p="lg" radius="lg" shadow="md" maxW={320}>
      <Block>
        <Block>
          <Text variant="small" color="muted">
            Upcoming match
          </Text>
          <Text variant="h6">Falcons at Bears</Text>
        </Block>
        <Text color="muted">
          Kickoff is set for 7:30 PM with rain in the forecast. Review the lineup and
          travel logistics before departure.
        </Text>
  <Button size="sm" variant="filled" onPress={() => {}}>
          View itinerary
        </Button>
      </Block>
    </Card>
  );
}
