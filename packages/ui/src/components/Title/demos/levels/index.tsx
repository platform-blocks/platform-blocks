import { Block, Card, Title } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Title order={1}>Page heading (order=1)</Title>
        <Title order={2}>Section heading (order=2)</Title>
        <Title order={3}>Subsection heading (order=3)</Title>
        <Title order={4}>Fourth-level heading (order=4)</Title>
        <Title order={5}>Fifth-level heading (order=5)</Title>
        <Title order={6}>Sixth-level heading (order=6)</Title>
      </Block>
    </Card>
  );
}
