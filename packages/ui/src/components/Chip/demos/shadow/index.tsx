import { Chip, Row } from '@platform-blocks/react-ui-library'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip shadow="none">No Shadow</Chip>
      <Chip shadow="xs">XS Shadow</Chip>
      <Chip shadow="sm">SM Shadow</Chip>
      <Chip shadow="md">MD Shadow</Chip>
      <Chip shadow="lg">LG Shadow</Chip>
      <Chip shadow="xl">XL Shadow</Chip>
    </Row>
  )
}
