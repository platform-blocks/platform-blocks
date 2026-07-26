import { Chip, Row } from '@platform-blocks/ui'

export default function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip variant="filled" color="primary">
        Filled
      </Chip>
      <Chip variant="outline" color="primary">
        Outline
      </Chip>
      <Chip variant="light" color="primary">
        Light
      </Chip>
      <Chip variant="subtle" color="primary">
        Subtle
      </Chip>
      <Chip variant="surface">
        Surface
      </Chip>
      <Chip variant="gradient" color="primary">
        Gradient
      </Chip>
    </Row>
  )
}