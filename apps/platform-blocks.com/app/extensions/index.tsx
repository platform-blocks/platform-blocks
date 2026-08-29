import { router } from 'expo-router';
import { BrandButton, Button, Card, Chip, Column, Flex, Text, Title } from '@platform-blocks/ui';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import {
  EXTENSION_TEMPLATE_URL,
  EXTENSIONS,
  EXTENSIONS_INVITE,
  EXTENSIONS_SUBTITLE,
  EXTENSIONS_TITLE,
} from '../../config/extensions';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

export default function ExtensionsScreen() {
  useBrowserTitle(formatPageTitle(EXTENSIONS_TITLE));

  return (
    <DocsPage>
      <Column gap="xl">
        <DocsPageHeader subtitle={EXTENSIONS_SUBTITLE}>
          {EXTENSIONS_TITLE}
        </DocsPageHeader>

        <Flex direction="row" wrap="wrap" gap="md">
          {EXTENSIONS.map(extension => (
            <Card
              key={extension.name}
              variant="elevated"
              p="lg"
              style={{ flexBasis: 380, flexGrow: 1 }}
            >
              <Flex direction="column" justify="space-between" gap="md" style={{ flex: 1 }}>
                <Column gap="sm">
                  <Flex direction="row" align="center" gap="sm" wrap="wrap">
                    <Text variant="h4" weight="semibold">{extension.name}</Text>
                    <Chip
                      size="sm"
                      variant="light"
                      color={extension.official ? 'primary' : 'gray'}
                    >
                      {extension.official ? 'official' : 'community'}
                    </Chip>
                  </Flex>
                  <Text color="secondary">{extension.description}</Text>
                </Column>
                <Flex direction="row" gap="sm" wrap="wrap">
                  <BrandButton
                    brand="npm"
                    title="View on npm"
                    variant="light"
                    size="sm"
                    onPress={() => router.push(extension.npmUrl)}
                  />
                  <BrandButton
                    brand="github"
                    title="Source"
                    variant="subtle"
                    size="sm"
                    onPress={() => router.push(extension.repoUrl)}
                  />
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Card variant="outline" p="lg">
          <Column gap="sm">
            <Title order={3}>Build your own</Title>
            <Text color="secondary">
              The extension template gives you a complete development environment: a sample
              component wired into the Platform Blocks theme, an Expo example app that
              hot-reloads your package on iOS, Android, and web, tests, linting, a production
              build, CI, and one-command npm releases.
            </Text>
            <Text color="secondary">{EXTENSIONS_INVITE}</Text>
            <Flex direction="row" gap="sm" wrap="wrap">
              <Button
                title="Use the extension template"
                variant="filled"
                size="sm"
                onPress={() => router.push(EXTENSION_TEMPLATE_URL)}
              />
            </Flex>
          </Column>
        </Card>
      </Column>
    </DocsPage>
  );
}
