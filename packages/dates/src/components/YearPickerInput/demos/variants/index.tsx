import { Column } from '@plocks/ui';
import { YearPickerInput } from '@plocks/dates';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <YearPickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a year" />
      ))}
    </Column>
  );
}
