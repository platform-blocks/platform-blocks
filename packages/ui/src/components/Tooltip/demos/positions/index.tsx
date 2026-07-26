import { Block, Button, Card, Row, Text, Tooltip } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Card p="md">
      <Block>
        <Text size="sm" colorVariant="secondary">
          Pass a `position` value to choose where the tooltip appears.
        </Text>
        <Row gap="md" justify="center" wrap="wrap">
          <Tooltip label="Appears above the target" position="top" withArrow>
            <Button size="sm" variant="outline">
              Top
            </Button>
          </Tooltip>
          <Tooltip label="Appears below the target" position="bottom" withArrow>
            <Button size="sm" variant="outline">
              Bottom
            </Button>
          </Tooltip>
          <Tooltip label="Anchors to the left" position="left" withArrow>
            <Button size="sm" variant="outline">
              Left
            </Button>
          </Tooltip>
          <Tooltip label="Anchors to the right" position="right" withArrow>
            <Button size="sm" variant="outline">
              Right
            </Button>
          </Tooltip>
        </Row>
      </Block>
    </Card>
  );
}
