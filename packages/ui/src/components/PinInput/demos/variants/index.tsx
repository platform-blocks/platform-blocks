import { Column, PinInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <PinInput key={variant} variant={variant} label={`${variant} variant`} />
      ))}
    </Column>
  );
}
