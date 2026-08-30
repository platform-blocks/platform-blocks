import { Platform } from 'react-native';
import { Block, Button, Card, Spotlight, Text, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/react-ui-library';

// Reuse a moderate list to showcase vertical scroll in fullscreen
const actions: SpotlightProps['actions'] = Array.from({ length: 18 }).map((_, index) => ({
  id: `mobile-action-${index}`,
  label: `Mobile action ${index + 1}`,
  description: 'Available on every screen',
  icon: 'star',
  onPress: () => console.log('mobile action', index + 1),
}));

export function Demo() {
  const [store] = useSpotlightStoreInstance();
  const isMobile = Platform.OS !== 'web';

  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Force the `fullscreen` variant to mimic a native sheet on touch devices while keeping the modal layout on web for comparison.
          </Text>
          <Button onPress={() => store.open()}>
            {isMobile ? 'Open fullscreen spotlight' : 'Open spotlight'}
          </Button>
          <Text size="xs" color="secondary">
            The component already auto-detects mobile surfaces; this demo pins the variant for clarity.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} variant="fullscreen" store={store} />
    </Block>
  );
}
