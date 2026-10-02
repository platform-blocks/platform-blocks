import { Column, AutoComplete } from '@plocks/ui';

const options = ['Apple', 'Banana', 'Cherry'].map(value => ({ label: value, value: value.toLowerCase() }));

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <AutoComplete key={variant} variant={variant} label={`${variant} variant`} data={options} placeholder="Choose a fruit" />
      ))}
    </Column>
  );
}
