import { router } from 'expo-router';
import { Linking } from 'react-native';
import { hasDOM, Button, Card, Chip, Column, Flex, IconButton, Link, Popover, Text, Title } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { GithubIcon } from '../../components/GithubIcon';
import { EXAMPLE_APPS } from '../../config/exampleApps';
import { EXAMPLES, EXAMPLES_SUBTITLE, EXAMPLES_TITLE } from '../../config/examples';
import { EXAMPLE_APPS_REPO, EXAMPLE_APPS_REPO_PUBLISHED, GITHUB_REPO, SITE_URL } from '../../config/urls';
import { buildAppSnackUrl } from '../../utils/appSnackUrl';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

export default function ExamplesScreen() {
  useBrowserTitle(formatPageTitle(EXAMPLES_TITLE));
  const demosBundled = process.env.EXPO_PUBLIC_DEMOS_BUNDLED === 'true';
  const openDemoPage = (slug: string) => {
    const origin = hasDOM ? window.location.origin : SITE_URL;
    const pathname = `/demos/${encodeURIComponent(slug)}/`;
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
            const snackUrl = EXAMPLE_APPS_REPO_PUBLISHED
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
                      <Popover position="bottom-start" w={228}>
                        <Popover.Target>
                          <Button title="Web demo QR code" variant="light" size="sm" />
                        </Popover.Target>
                        <Popover.Dropdown accessibilityLabel={`${example.title} web demo QR code`}>
                          <Column align="center" gap="xs" p="md">
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
                        </Popover.Dropdown>
                      </Popover>
                    )}
                    <IconButton
                      icon={<GithubIcon />}
                      variant="ghost"
                      size="sm"
                      accessibilityLabel={`View ${example.title} source on GitHub`}
                      tooltip={`View ${example.title} source on GitHub`}
                      onPress={() => Linking.openURL(`${EXAMPLE_APPS_REPO}/tree/main/apps/${example.slug}`)}
                    />
                    {snackUrl && (
                      <Button title="Try native in Snack" variant="light" size="sm" onPress={() => Linking.openURL(snackUrl)} />
                    )}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>

        <Text variant="small" c="secondary">
          Web QR codes open browser demos. For apps with a native Snack preview, open Snack on a computer and scan its Expo Go QR code.
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
                  <IconButton
                    icon={<GithubIcon />}
                    variant="ghost"
                    size="sm"
                    accessibilityLabel={`View ${example.title} source on GitHub`}
                    tooltip={`View ${example.title} source on GitHub`}
                    onPress={() => Linking.openURL(`${GITHUB_REPO}/blob/main/${example.sourcePath}`)}
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
