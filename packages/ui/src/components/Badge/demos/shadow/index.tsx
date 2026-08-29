import { Badge, Row } from '@platform-blocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Badge shadow="none">No Shadow</Badge>
      <Badge shadow="xs">XS Shadow</Badge>
      <Badge shadow="sm">SM Shadow</Badge>
      <Badge shadow="md">MD Shadow</Badge>
      <Badge shadow="lg">LG Shadow</Badge>
      <Badge shadow="xl">XL Shadow</Badge>
    </Row>
  )
}
