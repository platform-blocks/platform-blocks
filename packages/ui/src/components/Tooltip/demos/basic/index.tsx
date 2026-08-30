import { Block, Button, Card, Text, Tooltip } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Card p="md">
      <Block align="flex-start">
        <Text size="sm" color="secondary">
          Wrap interactive elements with `Tooltip` to introduce short helper text.
        </Text>
        <Tooltip label="Invite teammates" withArrow>
          <Button size="sm" variant="outline">
            Invite teammates
          </Button>
        </Tooltip>
      </Block>
    </Card>
  );
}
