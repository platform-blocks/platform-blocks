import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@platform-blocks/ui';

import { EXAMPLE_REGISTRY } from './exampleRegistry';
import { EXAMPLES } from '../../config/examples';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

/**
 * Chrome-less host for one example (config/docsLayout.tsx hides the site
 * header and sidebar for /examples/<slug> routes). A floating button in the
 * bottom-left corner returns to the gallery.
 */
export function ExampleScreen({ slug }: { slug: string }) {
  const insets = useSafeAreaInsets();
  const entry = EXAMPLES.find(example => example.slug === slug);
  const Example = EXAMPLE_REGISTRY[slug];

  useBrowserTitle(formatPageTitle(entry ? `${entry.title} example` : 'Example'));

  if (!Example) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Example />
      <View
        style={{
          position: 'absolute',
          left: 16,
          bottom: insets.bottom + 16,
        }}
      >
        <IconButton
          icon="arrowLeft"
          variant="secondary"
          accessibilityLabel="Back to all examples"
          onPress={() => router.push('/examples')}
        />
      </View>
    </View>
  );
}
