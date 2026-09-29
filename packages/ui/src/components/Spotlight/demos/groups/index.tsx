import { Block, Button, Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

const actions: SpotlightProps['actions'] = [
  {
    group: 'Navigation',
    actions: [
      { id: 'home', label: 'Home', icon: 'home', onPress: () => console.log('navigate: home') },
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Jump to the analytics overview',
        icon: 'star',
        onPress: () => console.log('navigate: dashboard'),
      },
    ],
  },
  {
    group: 'Settings',
    actions: [
      { id: 'profile', label: 'Profile', icon: 'user', onPress: () => console.log('navigate: profile') },
      {
        id: 'billing',
        label: 'Billing settings',
        description: 'Manage payment methods',
        icon: 'settings',
        onPress: () => console.log('navigate: billing'),
      },
    ],
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
