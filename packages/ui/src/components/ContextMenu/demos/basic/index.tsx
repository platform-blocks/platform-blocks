import { Card, ContextMenu, Text } from '@plocks/ui';

const ITEMS = [
  { id: 'copy', label: 'Copy' },
  { id: 'rename', label: 'Rename' },
  { id: 'delete', label: 'Delete', danger: true },
];

export function Demo() {
  return (
    <ContextMenu items={ITEMS}>
      {(triggerProps) => (
        <Card {...triggerProps} padding="2xl">
          <Text>Right-click or long-press me</Text>
        </Card>
      )}
    </ContextMenu>
  );
}
