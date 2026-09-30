import { Block, Button, Icon } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions: SpotlightProps['actions'] = [
  {
    id: 'deploy',
    label: 'Deploy service',
    description: 'Trigger the CI/CD pipeline',
    icon: <Icon name="bolt" />,
    onPress: () => console.log('deploy service'),
  },
  {
    id: 'logs',
    label: 'Inspect logs',
    description: 'Open the latest runtime logs',
    icon: <Icon name="code" />,
    onPress: () => console.log('view logs'),
  },
  {
    id: 'alerts',
    label: 'Review alerts',
    description: 'Check active incidents',
    icon: <Icon name="bell" />,
    onPress: () => console.log('open alerts'),
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
