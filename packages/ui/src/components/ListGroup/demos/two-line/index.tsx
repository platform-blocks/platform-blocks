import { ListGroup, ListGroupItem } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <ListGroup variant="bordered" style={{ width: '100%', maxWidth: 360 }}>
      <ListGroupItem
        label="Download your data"
        description="A ZIP bundle of your profile, library, and history"
      />
      <ListGroupItem label="Privacy" description="Control who sees your activity" />
      <ListGroupItem label="About" />
    </ListGroup>
  );
}
