import { Block, Button, EmptyState, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <EmptyState>
        <EmptyState.Indicator>
          <Icon name="search" />
        </EmptyState.Indicator>
        <EmptyState.Title order={2}>Nothing here yet</EmptyState.Title>
        <EmptyState.Description>Add your first item.</EmptyState.Description>
        <EmptyState.Actions>
          <Button>Add item</Button>
        </EmptyState.Actions>
      </EmptyState>
    </Block>
  );
}
