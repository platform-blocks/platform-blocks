import { Block, Button, Card, Spotlight, Text, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

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

export default function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" colorVariant="secondary">
            Spotlight provides a keyboard-driven command palette. Open it with `⌘K` or `Ctrl+K`, or trigger it imperatively from a button.
          </Text>
          <Button onPress={() => store.open()}>Open spotlight</Button>
          <Text size="xs" colorVariant="secondary">
            You can reuse the same store across multiple triggers.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
