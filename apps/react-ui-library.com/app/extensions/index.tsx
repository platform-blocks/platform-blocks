import { router } from 'expo-router';
import { BrandButton, Button, Card, Chip, Column, Flex, Text, Title } from '@platform-blocks/react-ui-library';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import {
  EXTENSION_CONTRACT,
  EXTENSION_TEMPLATE_URL,
  EXTENSIONS,
  EXTENSIONS_DEFINITION,
  EXTENSIONS_INVITE,
  EXTENSIONS_PUBLISH_STEPS,
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

        {/* The registry answers "what exists"; this answers "what one is" —
            without it, an extension reads as nothing more than a dependency. */}
        <Column gap="md">
          <Text color="secondary">{EXTENSIONS_DEFINITION}</Text>
          <Flex direction="row" wrap="wrap" gap="md">
            {EXTENSION_CONTRACT.map(point => (
              <Card
                key={point.title}
                variant="subtle"
                p="md"
                style={{ flexBasis: 280, flexGrow: 1 }}
              >
                <Column gap="xs">
                  <Text weight="semibold">{point.title}</Text>
                  <Text variant="small" color="secondary">{point.detail}</Text>
                </Column>
              </Card>
            ))}
          </Flex>
        </Column>

        <Column gap="sm">
          <Title order={3}>Published extensions</Title>
        </Column>

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
          <Column gap="md">
            <Title order={3}>Build your own</Title>
            <Text color="secondary">{EXTENSIONS_INVITE}</Text>
            <Column gap="sm">
              {EXTENSIONS_PUBLISH_STEPS.map((step, index) => (
                <Flex key={step.title} direction="row" gap="sm" align="flex-start">
                  <Chip size="sm" variant="light" color="primary">{index + 1}</Chip>
                  <Column gap={2} style={{ flex: 1 }}>
                    <Text weight="semibold">{step.title}</Text>
                    <Text variant="small" color="secondary">{step.detail}</Text>
                  </Column>
                </Flex>
              ))}
            </Column>
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
