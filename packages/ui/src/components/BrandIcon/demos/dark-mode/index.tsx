import { BrandIcon, Row } from '@platform-blocks/ui';
import { DARK_MODE_BRANDS } from '../data';

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {DARK_MODE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
