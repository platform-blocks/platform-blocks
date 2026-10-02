import { IconButton, Row } from '@plocks/ui';

const variants = ['default', 'filled', 'secondary', 'outline', 'ghost', 'gradient', 'none'] as const;

export function Demo() {
  return (
    <Row gap="sm" align="center" wrap="wrap">
      {variants.map(variant => (
        <IconButton key={variant} icon="heart" variant={variant} accessibilityLabel={`${variant} icon button`} tooltip={variant} />
      ))}
    </Row>
  );
}
