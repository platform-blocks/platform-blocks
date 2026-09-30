import { Badge, Row } from '@plocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Badge>New</Badge>
      <Badge>Beta</Badge>
      <Badge>v1.0</Badge>
    </Row>
  )
}
