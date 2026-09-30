import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

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
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} limit={8} store={store} />
    </Block>
  );
}
