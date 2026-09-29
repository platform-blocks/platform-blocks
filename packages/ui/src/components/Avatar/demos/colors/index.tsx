import { Avatar, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Avatar fallback="PR" bg="primary.5" />
      <Avatar fallback="SU" bg="success.5" />
      <Avatar fallback="WA" bg="warning.5" />
      <Avatar fallback="ER" bg="error.5" />
      <Avatar fallback="AB" bg="#FF6B6B" />
    </Row>
  );
}
