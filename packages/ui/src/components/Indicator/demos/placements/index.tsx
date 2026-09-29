import { Block, Indicator, Row, Text } from '@platform-blocks/ui';

const PLACEMENTS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      {PLACEMENTS.map((placement) => (
        <Block
          key={placement}
          w={88}
          h={88}
          radius="lg"
          bg="subtle"
          position="relative"
          align="center"
          justify="center"
        >
          <Text size="xs" c="secondary">
            {placement}
          </Text>
          <Indicator placement={placement} />
        </Block>
      ))}
    </Row>
  );
}
