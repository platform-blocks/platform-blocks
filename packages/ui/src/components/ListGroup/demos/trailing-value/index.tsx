import { Badge, ListGroup, ListGroupItem } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <ListGroup variant="bordered" style={{ width: '100%', maxWidth: 360 }}>
      <ListGroupItem label="Username" value="@ada" />
      <ListGroupItem label="Language" description="App language" value="English" />
      <ListGroupItem value="2 unread" endSection={<Badge>New</Badge>}>
        Inbox
      </ListGroupItem>
    </ListGroup>
  );
}
