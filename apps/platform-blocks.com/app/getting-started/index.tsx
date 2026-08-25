import { router } from 'expo-router';
import { DocsPage } from '../../components/DocsPage';
import {
  Alert,
  BrandButton,
  BrandIcon,
  Button,
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
import {
  GETTING_STARTED_PREREQUISITES,
  GETTING_STARTED_STEPS,
  GETTING_STARTED_SUBTITLE,
} from '../../config/gettingStarted';
import {
  STARTER_TEMPLATES,
  TEMPLATES_COMMUNITY_INVITE,
  TEMPLATES_GUIDANCE,
  TEMPLATES_SUBTITLE,
  TEMPLATES_TITLE,
} from '../../config/templates';
import { GITHUB_REPO } from '../../config/urls';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

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
          subtitle={GETTING_STARTED_SUBTITLE}
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
          {GETTING_STARTED_PREREQUISITES}
        </Alert>

        {GETTING_STARTED_STEPS.map(({ title, lead, code, fileName, variant, note }) => (
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
            subtitle={TEMPLATES_SUBTITLE}
            subtitleProps={{ variant: 'p' }}
          >
            {TEMPLATES_TITLE}
          </Title>

          <Text variant="p" colorVariant="secondary">{TEMPLATES_GUIDANCE}</Text>

          <Grid columns={12} gap="md">
            {STARTER_TEMPLATES.map(t => (
              <GridItem key={t.key} span={{ base: 12, md: 6, lg: 4 }}>
                <Card variant="elevated" p="md" style={{ flex: 1 }}>
                  <Flex direction="column" justify="space-between" gap="md" style={{ flex: 1 }}>
                    <Column gap="sm">
                      <Flex direction="row" align="center" gap="sm" wrap="wrap">
                        <Text variant="h4" weight="semibold">{t.name}</Text>
                        {!t.available && (
                          <Chip size="sm" color="gray" variant="light">coming soon</Chip>
                        )}
                      </Flex>
                      <Text variant="p" colorVariant="secondary">{t.description}</Text>
                      <Flex direction="row" gap="xs" wrap="wrap">
                        {t.tags.map(tag => (
                          <Chip key={tag} size="sm" variant="surface">{tag}</Chip>
                        ))}
                      </Flex>
                    </Column>
                    {t.available && (
                      <Button
                        title="Use template"
                        variant="light"
                        size="sm"
                        onPress={() => router.push(t.repo)}
                      />
                    )}
                  </Flex>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Flex direction="row" align="center" gap="sm" wrap="wrap">
            <Text variant="small" colorVariant="secondary">{TEMPLATES_COMMUNITY_INVITE}</Text>
            <Button
              title="Share your starter"
              variant="subtle"
              size="sm"
              onPress={() => router.push(`${GITHUB_REPO}/issues/new?template=community_template.yml`)}
            />
          </Flex>
        </Column>

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
