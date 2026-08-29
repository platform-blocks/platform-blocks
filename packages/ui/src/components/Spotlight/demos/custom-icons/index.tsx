import { Block, Button, Card, Icon, Spotlight, Text, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

const actions: SpotlightProps['actions'] = [
  {
    id: 'deploy',
    label: 'Deploy service',
    description: 'Trigger the CI/CD pipeline',
    icon: <Icon name="bolt" size="md" />,
    onPress: () => console.log('deploy service'),
  },
  {
    id: 'logs',
    label: 'Inspect logs',
    description: 'Open the latest runtime logs',
    icon: <Icon name="code" size="md" />,
    onPress: () => console.log('view logs'),
  },
  {
    id: 'alerts',
    label: 'Review alerts',
    description: 'Check active incidents',
    icon: <Icon name="bell" size="md" />,
    onPress: () => console.log('open alerts'),
  },
];

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Icons accept full React nodes, so you can swap in composable UI like `Icon`, avatars, or status badges for richer visuals.
          </Text>
          <Button variant="outline" onPress={() => store.open()}>
            Open spotlight
          </Button>
        </Block>
      </Card>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
