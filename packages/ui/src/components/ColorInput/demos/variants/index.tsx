import { Column, ColorInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <ColorInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a color" />
      ))}
    </Column>
  );
}
