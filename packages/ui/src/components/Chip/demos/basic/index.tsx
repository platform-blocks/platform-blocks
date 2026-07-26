import { Chip, Row } from '@platform-blocks/ui'

export default function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip>Design</Chip>
      <Chip>Engineering</Chip>
      <Chip>Research</Chip>
    </Row>
  )
}
