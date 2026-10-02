import { Column } from '@plocks/ui';
import { TimePickerInput } from '@plocks/dates';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <TimePickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a time" />
      ))}
    </Column>
  );
}
