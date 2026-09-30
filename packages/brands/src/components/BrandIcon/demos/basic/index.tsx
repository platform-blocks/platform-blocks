import { Row } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import { SAMPLE_BRANDS } from '../data';

export function Demo() {
  return (
    <Row align="center" gap="md" wrap="wrap">
      {SAMPLE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
