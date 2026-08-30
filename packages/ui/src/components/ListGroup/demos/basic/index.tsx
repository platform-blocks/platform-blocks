import { ListGroup, ListGroupItem } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <ListGroup variant="bordered" style={{ width: '100%', maxWidth: 360 }}>
      <ListGroupItem>Overview</ListGroupItem>
      <ListGroupItem>Analytics</ListGroupItem>
      <ListGroupItem>Reports</ListGroupItem>
      <ListGroupItem>Settings</ListGroupItem>
    </ListGroup>
  );
}
