import { Column, PhoneInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <PhoneInput key={variant} variant={variant} label={`${variant} variant`} placeholder="(555) 123-4567" />
      ))}
    </Column>
  );
}
