import { Block, Button, SegmentedControl, usePersistedState } from '@plocks/ui';

const VIEWS = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
  { label: 'Table', value: 'table' },
];

export function Demo() {
  const [view, setView, { remove }] = usePersistedState('plocks-demo:view', 'grid');

  return (
    <Block align="center" gap="sm">
      <SegmentedControl data={VIEWS} value={view} onChange={setView} />
      <Button size="sm" variant="subtle" onPress={remove}>
        Reset
      </Button>
    </Block>
  );
}
