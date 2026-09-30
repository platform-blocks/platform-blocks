import { Block, FileInput } from '@plocks/ui';

const sizes = [
  { label: 'Small', size: 'sm' as const },
  { label: 'Medium (default)', size: 'md' as const },
  { label: 'Large', size: 'lg' as const },
];

export function Demo() {
  return (
    <Block fullWidth>
      {sizes.map(({ label, size }) => (
        <FileInput key={size} label={label} size={size} fullWidth />
      ))}
      <FileInput
        label="Custom placeholder"
        placeholder="Click to select your files"
        fullWidth
      />
    </Block>
  );
}
