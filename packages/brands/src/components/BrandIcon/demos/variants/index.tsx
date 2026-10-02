import { Column, Row, Text } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
  return (
    <Column gap="md">
      <Row align="center" gap="sm"><BrandIcon brand="google" variant="full" size="xl" /><Text>Full color</Text></Row>
      <Row align="center" gap="sm"><BrandIcon brand="google" variant="mono" color="royalblue" size="xl" /><Text>Monochrome</Text></Row>
    </Column>
  );
}
