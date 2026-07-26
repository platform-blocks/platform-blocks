import { router } from 'expo-router';
import { DocsPage } from '../../components/DocsPage';
import {
  Alert,
  BrandButton,
  BrandIcon,
  Card,
  Chip,
  CodeBlock,
  Column,
  Flex,
  Grid,
  GridItem,
  Text,
  Title,
} from '@platform-blocks/ui';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { PLATFORMS, getTagConfig, type TagType } from '../../config/platforms';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

/** Install → provider → first render. Each step is one command or one file. */
const STEPS = [
  {
    title: 'Install with npm',
    lead: 'Add Platform Blocks to your React Native or Expo project:',
    code: 'npm install @platform-blocks/ui',
    variant: 'terminal' as const,
    note: 'This installs the core library — every component, hook, and utility.',
  },
  {
    title: 'Install the peer dependencies',
    lead: 'Platform Blocks builds on a handful of packages your app provides. On Expo, install them with expo install so the versions match your SDK:',
    code: `npx expo install react-native-reanimated react-native-safe-area-context react-native-svg @tabler/icons-react-native

# without Expo
npm install react-native-reanimated react-native-safe-area-context react-native-svg @tabler/icons-react-native`,
    variant: 'terminal' as const,
    note: '@tabler/icons-react-native backs the Icon registry, which is imported from the package root — without it, Icon and every component that renders one will fail to resolve. Optional integrations (expo-audio, expo-haptics, expo-linear-gradient, @shopify/flash-list, and others) are loaded lazily and only needed for the features that use them.',
  },
  {
    title: 'Set up the provider',
    lead: 'Wrap your root component with PlatformBlocksProvider to enable theming:',
    fileName: 'App.tsx',
    code: `import React from 'react';
import { PlatformBlocksProvider } from '@platform-blocks/ui';
import { YourApp } from './YourApp';

export default function App() {
  return (
    <PlatformBlocksProvider>
      <YourApp />
    </PlatformBlocksProvider>
  );
}`,
  },
  {
    title: 'Verify the install',
    lead: 'Render a component to confirm everything is wired up:',
    fileName: 'TestComponent.tsx',
    code: `import React from 'react';
import { Text, Button, Card } from '@platform-blocks/ui';

export function TestComponent() {
  return (
    <Card variant='outline'>
      <Text variant='h2'>
        Welcome to PlatformBlocks! 🎉
      </Text>
      <Button
        title='It works!'
        variant='filled'
        onPress={() => console.log('Success!')}
      />
    </Card>
  );
}`,
  },
];

const renderTagChip = (tag: TagType) => {
  const config = getTagConfig(tag);
  return (
    <Chip
      key={tag}
      size="sm"
      color={config.color}
      variant={config.variant as any}
      style={{ marginLeft: 4 }}
    >
      {tag}
    </Chip>
  );
};

export default function GettingStartedScreen() {
  useBrowserTitle(formatPageTitle('Getting Started'));

  return (
    <DocsPage>
      {/* Sections only — the page column and its inset come from DocsPage, the
          same geometry component detail pages use. */}
      <Column gap="xl">
        <DocsPageHeader
          subtitle="Install Platform Blocks, wire up the provider, and render your first component."
          action={
            <BrandButton
              title="View on NPM"
              brand="npm"
              size="md"
              onPress={() => router.push('https://www.npmjs.com/package/@platform-blocks/ui')}
            />
          }
        >
          Getting Started
        </DocsPageHeader>

        <Alert sev="info" variant="light" title="Prerequisites" fullWidth>
          Node.js and npm installed.
        </Alert>

        {STEPS.map(({ title, lead, code, fileName, variant, note }) => (
          <Column key={title} gap="md">
            <Title order={2} size={28} weight="bold">{title}</Title>
            <Text variant="p" colorVariant="secondary">{lead}</Text>
            <CodeBlock
              variant={variant}
              files={fileName ? [{ name: fileName }] : undefined}
              language={fileName ? undefined : 'bash'}
              fullWidth
            >
              {code}
            </CodeBlock>
            {note ? (
              <Text variant="small" colorVariant="secondary">{note}</Text>
            ) : null}
          </Column>
        ))}

        <Column gap="md">
          <Title
            order={2}
            size={28}
            weight="bold"
            subtitle="One component model. Native feel everywhere."
            subtitleProps={{ variant: 'p' }}
          >
            Platforms
          </Title>

          <Grid columns={12} gap="md">
            {PLATFORMS.map(p => (
              <GridItem key={p.key} span={{ base: 12, lg: 4 }}>
                <Card variant="elevated" p="md">
                  <Flex direction="column" justify="space-between" gap="md">
                    <Flex direction="row" align="center" gap="sm">
                      <BrandIcon brand={p.brand as any} size="xl" />
                      <Text variant="h3" weight="semibold">{p.label}</Text>
                      <Text variant="small" colorVariant="secondary">({p.note})</Text>
                      {p.tags?.map(renderTagChip)}
                    </Flex>
                    <Text variant="p" colorVariant="secondary">
                      {p.description}
                    </Text>
                  </Flex>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Column>
      </Column>
    </DocsPage>
  );
}
