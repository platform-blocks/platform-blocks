import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions: SpotlightProps['actions'] = Array.from({ length: 18 }).map((_, index) => ({
  id: `mobile-action-${index}`,
  label: `Mobile action ${index + 1}`,
  description: 'Available on every screen',
  icon: 'star',
  onPress: () => console.log('mobile action', index + 1),
}));

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} variant="fullscreen" store={store} />
    </Block>
  );
}
