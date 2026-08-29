import { Badge, Row } from '@platform-blocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Badge color="primary">Primary</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="warning">Warning</Badge>
      <Badge color="error">Error</Badge>
      <Badge color="gray">Gray</Badge>
    </Row>
  )
}