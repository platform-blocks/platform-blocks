import { Column, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Column gap="md">
      <Text variant="h2">Section heading</Text>
      <Text variant="p">A paragraph uses the body text role.</Text>
      <Text variant="blockquote">A quotation gets its own semantic element.</Text>
      <Text variant="code">const label = 'inline code';</Text>
      <Text variant="small">Supporting text uses the small role.</Text>
    </Column>
  );
}
