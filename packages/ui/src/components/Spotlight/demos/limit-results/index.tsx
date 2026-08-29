import { Block, Button, Card, Spotlight, Text, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

const actions: SpotlightProps['actions'] = Array.from({ length: 25 }).map((_, index) => ({
  id: `command-${index}`,
  label: `Command ${index + 1}`,
  description: `Example action #${index + 1}`,
  icon: 'star',
  onPress: () => console.log('command', index + 1),
}));

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Set the `limit` prop to constrain how many results render, even if more actions match the query.
          </Text>
          <Button onPress={() => store.open()}>Open spotlight</Button>
          <Text size="xs" color="secondary">
            This demo caps the list at 8 items.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} limit={8} store={store} />
    </Block>
  );
}
