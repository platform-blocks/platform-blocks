import { Block, EmptyState, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <EmptyState size="xs" icon={<Icon name="search" />} title="Small placeholder" />
    </Block>
  );
}
