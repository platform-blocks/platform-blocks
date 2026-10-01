import React from 'react';
import { router } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { Button, Card, Chip, Column, Flex, Link, Text, Title } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { EXAMPLE_APPS } from '../../config/exampleApps';
import { EXAMPLES, EXAMPLES_SUBTITLE, EXAMPLES_TITLE } from '../../config/examples';
import { EXAMPLE_APPS_REPO, EXAMPLE_APPS_REPO_PUBLISHED, GITHUB_REPO, SITE_URL } from '../../config/urls';
import { APP_SNACK_READY, buildAppSnackUrl } from '../../utils/appSnackUrl';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

export default function ExamplesScreen() {
  useBrowserTitle(formatPageTitle(EXAMPLES_TITLE));
  const [phonePreview, setPhonePreview] = React.useState<string | null>(null);
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
            const snackUrl = EXAMPLE_APPS_REPO_PUBLISHED && APP_SNACK_READY
              ? buildAppSnackUrl(example.slug)
              : null;
            const demoUrl = `${SITE_URL}/demos/${encodeURIComponent(example.slug)}/`;
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
                    {demosBundled && (
                      <Button
                        title={phonePreview === example.slug ? 'Hide QR code' : 'Open on phone'}
                        variant="light"
                        size="sm"
                        onPress={() => setPhonePreview(current => current === example.slug ? null : example.slug)}
                      />
                    )}
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
                  {phonePreview === example.slug && demosBundled && (
                    <Column align="center" gap="xs">
                      <QRCode
                        value={demoUrl}
                        size={164}
                        quietZone={4}
                        color="#111827"
                        bg="#FFFFFF"
                        accessibilityLabel={`QR code to open the ${example.title} web demo on a phone`}
                      />
                      <Text variant="small" c="secondary" ta="center">
                        Scan to open the web demo in your phone’s browser.
                      </Text>
                      <Link href={demoUrl} target="_blank" external size="xs">
                        Open demo link
                      </Link>
                    </Column>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Flex>

        <Text variant="small" c="secondary">
          Phone QR codes open the web demos. Expo Go previews are not available yet.
        </Text>

        {!demosBundled && (
          <Text variant="small" c="secondary">
            Live previews are included in the docs build made with the example apps checkout.
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
