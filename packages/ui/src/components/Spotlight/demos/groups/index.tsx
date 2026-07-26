import { Block, Button, Card, Spotlight, Text, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

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

export default function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" colorVariant="secondary">
            Group actions to create semantic sections inside the results list. Each group renders a header before its nested actions.
          </Text>
          <Button variant="secondary" onPress={() => store.open()}>
            Open spotlight
          </Button>
        </Block>
      </Card>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
