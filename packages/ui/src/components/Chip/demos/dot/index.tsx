import { Block, Chip, Row, Text } from '@platform-blocks/ui'

export default function Demo() {
  return (
    <Block fullWidth={false}>
      {/* Default: the dot inherits the chip's resolved text color per variant. */}
      <Row gap="xs" wrap="wrap" align="center">
        <Chip variant="filled" color="success" dot>
          Active
        </Chip>
        <Chip variant="light" color="warning" dot>
          Pending
        </Chip>
        <Chip variant="outline" color="error" dot>
          Failed
        </Chip>
        <Chip variant="subtle" color="gray" dot>
          Draft
        </Chip>
      </Row>

      {/* Override the dot color independently of the label color. */}
      <Row gap="xs" wrap="wrap" align="center">
        <Chip variant="light" color="gray" dotColor="#22C55E" dot>
          Online
        </Chip>
        <Chip variant="light" color="gray" dotColor="#F59E0B" dot>
          Away
        </Chip>
        <Chip variant="light" color="gray" dotColor="#EF4444" dot>
          Busy
        </Chip>
      </Row>

      <Text size="xs" colorVariant="muted">
        Use <Text size="xs" weight="600">dot</Text> to toggle the indicator and{' '}
        <Text size="xs" weight="600">dotColor</Text> to set a custom color.
      </Text>
    </Block>
  )
}
