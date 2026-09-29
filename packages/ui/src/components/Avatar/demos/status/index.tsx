import { Avatar, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="xl" wrap="wrap">
      <Avatar
        src={require('../../../../assets/avatars/avatar-1.png')}
        label="Josh"
        description="Online"
        online
      />
      <Avatar
        src={require('../../../../assets/avatars/avatar-3.png')}
        label="Mike"
        description="Focus time"
        online
        indicatorColor="#f59e0b"
      />
      <Avatar
        src={require('../../../../assets/avatars/avatar-4.png')}
        label="Tori"
        description="Offline"
      />
    </Row>
  );
}
