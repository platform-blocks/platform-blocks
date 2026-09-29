import { Block, Button, Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

const actions: SpotlightProps['actions'] = [
  {
    id: 'home',
    label: 'Go to home',
    description: 'Navigate to the home screen',
    icon: 'home',
    onPress: () => console.log('navigate: home'),
  },
  {
    id: 'profile',
    label: 'Open profile',
    description: 'View your account details',
    icon: 'user',
    onPress: () => console.log('navigate: profile'),
  },
  {
    id: 'settings',
    label: 'Adjust settings',
    description: 'Update application preferences',
    icon: 'settings',
    onPress: () => console.log('navigate: settings'),
  },
];

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
