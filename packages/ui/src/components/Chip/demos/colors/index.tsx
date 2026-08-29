import { Chip, Row } from '@platform-blocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="error">Error</Chip>
      <Chip color="gray">Gray</Chip>
    </Row>
  )
}