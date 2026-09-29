import { Badge, Row } from '@platform-blocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Badge c="primary">Primary</Badge>
      <Badge c="success">Success</Badge>
      <Badge c="warning">Warning</Badge>
      <Badge c="error">Error</Badge>
      <Badge c="gray">Gray</Badge>
    </Row>
  )
}