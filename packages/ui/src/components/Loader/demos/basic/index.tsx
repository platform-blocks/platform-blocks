import { Loader, Row } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Row gap="lg" align="center">
      <Loader variant="oval" />
      <Loader variant="bars" />
      <Loader variant="dots" />
    </Row>
  );
}


