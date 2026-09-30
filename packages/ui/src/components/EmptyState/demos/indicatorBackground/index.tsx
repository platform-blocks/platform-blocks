import { Block, EmptyState, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <EmptyState withIndicatorBackground icon={<Icon name="search" />} title="Nothing found" />
    </Block>
  );
}
