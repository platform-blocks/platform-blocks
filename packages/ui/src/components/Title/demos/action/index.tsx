import { Block, Button, Card, Title } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Card p="md">
      <Block>
        <Title action={<Button title="Action" size="sm" />}>Basic with action</Title>
        <Title underline action={<Button title="Edit" size="sm" variant="outline" />}>
          Underline with action
        </Title>
        <Title afterline action={<Button title="Settings" size="sm" variant="ghost" />}>
          Afterline with action
        </Title>
        <Title underline afterline action={<Button title="More" size="sm" />}>
          Full layout with action
        </Title>
      </Block>
    </Card>
  );
}