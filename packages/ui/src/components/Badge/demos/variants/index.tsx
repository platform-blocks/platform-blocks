import { Badge, Row } from '@platform-blocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Badge variant="filled">Filled</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="light">Light</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="gradient">Gradient</Badge>
    </Row>
  )
}