import { Column, Cascader } from '@plocks/ui';

const options = [{ value: 'us', label: 'United States', children: [{ value: 'nyc', label: 'New York' }] }];

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <Cascader key={variant} variant={variant} label={`${variant} variant`} data={options} placeholder="Choose a city" />
      ))}
    </Column>
  );
}
