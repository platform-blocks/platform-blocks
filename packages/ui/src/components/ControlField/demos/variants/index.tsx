import { Column, ControlField } from '@plocks/ui';

const variants = ['switch', 'checkbox', 'radio'] as const;

export function Demo() {
  return (
    <Column gap="sm" fullWidth>
      {variants.map(variant => (
        <ControlField key={variant} variant={variant} label={`${variant} control`} description="Tap the row to change its value" defaultChecked={variant === 'switch'} />
      ))}
    </Column>
  );
}
