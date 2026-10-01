import { Column, FormLayout, FormSection, Input, Text } from '@plocks/ui';

const variants = ['default', 'card', 'modal'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <FormLayout variant={variant}>
            <FormSection title="Profile"><Input label="Name" placeholder="Your name" /></FormSection>
          </FormLayout>
        </Column>
      ))}
    </Column>
  );
}
