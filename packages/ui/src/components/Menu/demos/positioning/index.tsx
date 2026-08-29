import { Button, Card, Menu, MenuDropdown, MenuItem, Row, Text } from '@platform-blocks/ui';

const POSITIONS = [
  { label: 'Bottom start', position: 'bottom-start' },
  { label: 'Bottom', position: 'bottom' },
  { label: 'Bottom end', position: 'bottom-end' },
  { label: 'Top start', position: 'top-start' },
  { label: 'Top', position: 'top' },
  { label: 'Top end', position: 'top-end' },
] as const;

export function Demo() {
  return (
    <Row gap="md" justify="center" wrap="wrap">
      {POSITIONS.map(({ label, position }) => (
        <Menu key={position} position={position}>
          <Button size="sm" variant="outline">
            {label}
          </Button>
          <MenuDropdown>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Archive</MenuItem>
          </MenuDropdown>
        </Menu>
      ))}
    </Row>
  );
}
