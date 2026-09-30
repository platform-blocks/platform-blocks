import { Block, EmptyState, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <EmptyState
        align="start"
        icon={<Icon name="search" />}
        title="No matches"
        description="Try another filter."
      />
    </Block>
  );
}
