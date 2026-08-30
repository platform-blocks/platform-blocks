import { useMemo, useState } from 'react';
import {
  Block,
  Button,
  Card,
  Row,
  spotlight,
  Spotlight,
  SpotlightProvider,
  Text,
  type SpotlightProps,
  useSpotlightStoreInstance,
} from '@platform-blocks/react-ui-library';

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
        <Card p="md">
          <Block>
            <Text size="sm" color="secondary">
              Combine local stores with the global `spotlight` helper. This demo adds actions to its scoped store while still toggling the shared palette.
            </Text>
            <Row gap="sm" wrap="wrap">
              <Button onPress={() => store.open()}>Open demo store</Button>
              <Button variant="outline" onPress={() => spotlight.toggle()}>
                Toggle global spotlight
              </Button>
            </Row>
            <Text size="xs" color="secondary">
              Select “Add dynamic action” to append more commands on the fly.
            </Text>
          </Block>
        </Card>
        <Spotlight actions={actions} store={store} />
        <Spotlight actions={globalActions} />
      </Block>
    </SpotlightProvider>
  );
}
