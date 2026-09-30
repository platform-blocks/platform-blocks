import { IconButton, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" align="center" wrap="wrap">
      <IconButton icon="home" tooltip="Home" />
      <IconButton icon="bell" variant="filled" tooltip="Notifications" />
      <IconButton icon="heart" variant="secondary" tooltip="Favorite" />
      <IconButton icon="settings" variant="outline" tooltip="Settings" />
      <IconButton icon="search" variant="ghost" tooltip="Search" />
      <IconButton icon="star" variant="gradient" tooltip="Star" />
    </Row>
  );
}
