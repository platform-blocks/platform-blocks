import { Loader, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="lg" align="center">
      <Loader variant="oval" />
      <Loader variant="bars" />
      <Loader variant="dots" />
    </Row>
  );
}


