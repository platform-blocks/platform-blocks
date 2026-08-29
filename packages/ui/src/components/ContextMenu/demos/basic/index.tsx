import { ContextMenu, Card, Text } from '@platform-blocks/ui';

const ITEMS = [
  { id: 'copy', label: 'Copy' },
  { id: 'rename', label: 'Rename' },
  { id: 'delete', label: 'Delete', danger: true },
];

export function Demo() {
  return (
    <ContextMenu items={ITEMS}>
      {(triggerProps) => (
        <Card {...triggerProps} style={{ padding: 24, alignItems: 'center' }}>
          <Text variant="p">Right-click or long-press me</Text>
        </Card>
      )}
    </ContextMenu>
  );
}
