import { useMemo, useState } from 'react';
import { Block, Button, Row } from '@plocks/ui';
import { spotlight, Spotlight, SpotlightProvider, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

const baseActions: SpotlightProps['actions'] = [
  {
    id: 'ping',
    label: 'Ping server',
    description: 'Send a ping to the backend',
    icon: 'bolt',
    onPress: () => console.log('ping'),
  },
  {
    id: 'refresh',
    label: 'Refresh data',
    description: 'Reload cached domain data',
    icon: 'refresh',
    onPress: () => console.log('refresh'),
  },
];

const globalActions: SpotlightProps['actions'] = [
  {
    id: 'global-home',
    label: 'Global home',
    description: 'Navigate home via the shared store',
    icon: 'home',
    onPress: () => console.log('global home'),
  },
  {
    id: 'global-settings',
    label: 'Global settings',
    description: 'Open the account-wide preferences',
    icon: 'settings',
    onPress: () => console.log('global settings'),
  },
];

export function Demo() {
  const [store] = useSpotlightStoreInstance();
  const [dynamicCount, setDynamicCount] = useState(0);

  const actions = useMemo<SpotlightProps['actions']>(
    () => [
      ...baseActions,
      {
        id: 'add-dynamic',
        label: 'Add dynamic action',
        icon: 'plus',
        onPress: () => setDynamicCount((count) => count + 1),
      },
      ...Array.from({ length: dynamicCount }).map((_, index) => ({
        id: `dynamic-${index}`,
        label: `Dynamic action ${index + 1}`,
        description: 'Added at runtime to the local store',
        icon: 'star',
        onPress: () => console.log('dynamic', index + 1),
      })),
    ],
    [dynamicCount]
  );

  return (
    <SpotlightProvider>
      <Block>
        <Row gap="sm" wrap="wrap">
          <Button onPress={() => store.open()}>Open scoped store</Button>
          <Button variant="outline" onPress={() => spotlight.toggle()}>
            Toggle global spotlight
          </Button>
        </Row>
        <Spotlight actions={actions} store={store} />
        <Spotlight actions={globalActions} />
      </Block>
    </SpotlightProvider>
  );
}
