import { Block, EmptyState, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <EmptyState
        icon={<Icon name="search" />}
        title="No results"
        description="Try a different search."
      />
    </Block>
  );
}
