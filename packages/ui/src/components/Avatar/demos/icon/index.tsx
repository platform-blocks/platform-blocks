import { Avatar, Icon, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" align="center">
      <Avatar
        fallback={<Icon name="user" color="white" />}
        bg="#6366f1"
      />
      <Avatar
        fallback={<Icon name="camera" color="white" />}
        bg="#10b981"
      />
      <Avatar
        fallback={<Icon name="bell" color="white" />}
        bg="#f59e0b"
      />
      <Avatar
        fallback={<Icon name="settings" color="white" />}
        bg="#ef4444"
      />
    </Row>
  );
}
