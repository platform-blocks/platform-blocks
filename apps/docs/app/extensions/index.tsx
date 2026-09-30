import { router } from 'expo-router';
import { Linking } from 'react-native';
import { Card, Chip, Column, Flex, Text, Title } from '@plocks/ui';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { PackageInstallCommand } from '../../components/PackageInstallCommand';
import {
  EXTENSIONS,
  EXTENSIONS_SUBTITLE,
  EXTENSIONS_TITLE,
  type ExtensionEntry,
} from '../../config/extensions';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

function PackageCards({ entries }: { entries: ExtensionEntry[] }) {
  return (
    <Flex direction="row" wrap="wrap" align="stretch" gap="md">
      {entries.map(extension => (
        <Card
          key={extension.name}
          variant="elevated"
          p="lg"
          onPress={() => extension.official
            ? router.push(`/components?package=${encodeURIComponent(extension.name)}`)
            : Linking.openURL(extension.npmUrl)}
          accessibilityLabel={`Explore ${extension.name}`}
          style={{ flexBasis: 380, flexGrow: 1 }}
        >
          <Flex direction="column" gap="md" style={{ flex: 1 }}>
            <Column gap="sm">
              <Flex direction="row" align="center" gap="sm" wrap="wrap">
                <Text variant="h4" fw="semibold">{extension.name}</Text>
                <Chip size="sm" variant="light" color={extension.official ? 'primary' : 'gray'}>
                  {extension.official ? 'official' : 'community'}
                </Chip>
              </Flex>
              <Text c="secondary">{extension.description}</Text>
              <PackageInstallCommand packageName={extension.name} compact />
            </Column>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

export default function ExtensionsScreen() {
  useBrowserTitle(formatPageTitle(EXTENSIONS_TITLE));
  const officialAddons = EXTENSIONS.filter(extension => extension.official);
  const communityExtensions = EXTENSIONS.filter(extension => !extension.official);

  return (
    <DocsPage>
      <Column gap="xl">
        <DocsPageHeader subtitle={EXTENSIONS_SUBTITLE}>
          {EXTENSIONS_TITLE}
        </DocsPageHeader>

        <PackageCards entries={officialAddons} />

        {communityExtensions.length > 0 && (
          <Column gap="md">
            <Title order={3}>Community extensions</Title>
            <PackageCards entries={communityExtensions} />
          </Column>
        )}

      </Column>
    </DocsPage>
  );
}
