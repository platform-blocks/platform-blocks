import { Column } from '@plocks/ui';
import { BrandButton } from '@plocks/brands';

const variants = ['plain', 'default', 'filled', 'light', 'outline', 'ghost'] as const;

export function Demo() {
  return (
    <Column gap="sm" align="flex-start">
      {variants.map(variant => (
        <BrandButton key={variant} brand="google" title={`Continue with Google · ${variant}`} variant={variant} />
      ))}
    </Column>
  );
}
