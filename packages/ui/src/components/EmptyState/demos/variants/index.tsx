import { Block, EmptyState, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <EmptyState
        icon={<Icon name="search" />}
        title="No results"
        variant="light"
        color="primary"
        size="lg"
      />
    </Block>
  );
}
