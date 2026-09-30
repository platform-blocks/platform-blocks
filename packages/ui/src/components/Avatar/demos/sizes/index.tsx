import { Avatar, Row } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Avatar key={size} size={size} fallback={size} />
      ))}
    </Row>
  );
}
