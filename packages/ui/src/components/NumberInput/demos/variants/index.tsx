import { Column, NumberInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <NumberInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Enter a quantity" />
      ))}
    </Column>
  );
}
