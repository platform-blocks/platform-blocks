import { router } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { Button, Card, Chip, Column, Flex, Text, Title } from '@plocks/ui';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { EXAMPLE_APPS } from '../../config/exampleApps';
import { EXAMPLES, EXAMPLES_SUBTITLE, EXAMPLES_TITLE } from '../../config/examples';
import { EXAMPLE_APPS_REPO, EXAMPLE_APPS_REPO_PUBLISHED, GITHUB_REPO, SITE_URL } from '../../config/urls';
import { APP_SNACK_PACKAGES_PUBLISHED, buildAppSnackUrl } from '../../utils/appSnackUrl';
import { SNACK_SDK_VERSION } from '../../utils/snackUrl';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

export default function ExamplesScreen() {
  useBrowserTitle(formatPageTitle(EXAMPLES_TITLE));
  const demosBundled = process.env.EXPO_PUBLIC_DEMOS_BUNDLED === 'true';
  const openDemoPage = (slug: string, source = false) => {
    const origin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    const pathname = `/demos/${encodeURIComponent(slug)}/${source ? 'source.html' : ''}`;
    Linking.openURL(`${origin}${pathname}`);
  };

  return (
    <DocsPage>
      <Column gap="xl">
        <DocsPageHeader subtitle={EXAMPLES_SUBTITLE}>
          {EXAMPLES_TITLE}
        </DocsPageHeader>

        <Flex direction="row" wrap="wrap" align="stretch" gap="md">
          {EXAMPLE_APPS.map(example => {
            const snackUrl = EXAMPLE_APPS_REPO_PUBLISHED && APP_SNACK_PACKAGES_PUBLISHED
              ? buildAppSnackUrl(example.slug)
              : null;
            return (
              <Card
                key={example.slug}
                variant="elevated"
                p="lg"
                style={{ flexBasis: 280, flexGrow: 1 }}
              >
                <Flex direction="column" justify="space-between" gap="md" style={{ flex: 1 }}>
                  <Column gap="sm">
                    <Chip size="sm" variant="surface">{example.category}</Chip>
                    <Title order={3}>{example.title}</Title>
                    <Text c="secondary">{example.description}</Text>
                  </Column>
                  <Flex direction="row" gap="sm" wrap="wrap">
                    <Button
                      title="Live demo"
                      size="sm"
                      disabled={!demosBundled}
                      onPress={() => openDemoPage(example.slug)}
                    />
                    <Button
                      title="View source"
                      variant="subtle"
                      size="sm"
                      disabled={!demosBundled && !EXAMPLE_APPS_REPO_PUBLISHED}
                      onPress={() => demosBundled
                        ? openDemoPage(example.slug, true)
                        : router.push(`${EXAMPLE_APPS_REPO}/tree/main/apps/${example.slug}`)}
                    />
                    {snackUrl && (
                      <Button title="Open in Snack" variant="light" size="sm" onPress={() => router.push(snackUrl)} />
                    )}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>

        {!demosBundled && (
          <Text variant="small" c="secondary">
            Live previews are included in the docs build made with the example apps checkout.
            Snack links will become available after the packages are published for Expo SDK {SNACK_SDK_VERSION}.
          </Text>
        )}

        <Column gap="sm">
          <Title order={2}>Component screens</Title>
          <Text c="secondary">Smaller, self-contained screens you can copy into a project.</Text>
        </Column>

        <Flex direction="row" wrap="wrap" align="stretch" gap="md">
          {EXAMPLES.map(example => (
            <Card
              key={example.slug}
              variant="elevated"
              p="lg"
              style={{ flexBasis: 340, flexGrow: 1 }}
            >
              <Flex direction="column" justify="space-between" gap="md" style={{ flex: 1 }}>
                <Column gap="sm">
                  <Title order={3}>{example.title}</Title>
                  <Text c="secondary">{example.description}</Text>
                  <Flex direction="row" gap="xs" wrap="wrap">
                    {example.components.map(component => (
                      <Chip key={component} size="sm" variant="surface">{component}</Chip>
                    ))}
                  </Flex>
                </Column>
                <Flex direction="row" gap="sm" wrap="wrap">
                  <Button
                    title="Open fullscreen"
                    variant="light"
                    size="sm"
                    onPress={() => router.push(`/examples/${example.slug}`)}
                  />
                  <Button
                    title="View source"
                    variant="subtle"
                    size="sm"
                    onPress={() => router.push(`${GITHUB_REPO}/blob/main/${example.sourcePath}`)}
                  />
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Text variant="small" c="secondary">
          These component screens are single files. Copy one into your app and adjust it to fit your
          product.
        </Text>
      </Column>
    </DocsPage>
  );
}
