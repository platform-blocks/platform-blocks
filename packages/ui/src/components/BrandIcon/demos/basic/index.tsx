import { BrandIcon, Row } from '@platform-blocks/ui';
import { SAMPLE_BRANDS } from '../data';

export default function Demo() {
  return (
    <Row align="center" gap="md" wrap="wrap">
      {SAMPLE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
