import { Column, TextArea } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <TextArea key={variant} variant={variant} label={`${variant} variant`} placeholder="Write a note" rows={2} />
      ))}
    </Column>
  );
}
