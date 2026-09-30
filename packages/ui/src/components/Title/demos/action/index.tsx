import { Block, Button, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title action={<Button title="Edit" size="sm" variant="outline" />}>Profile</Title>
    </Block>
  );
}
