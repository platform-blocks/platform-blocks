import React, { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Title, Text, Card, Chip, Column, Grid, GridItem, Row, Search } from '@platform-blocks/ui';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import { PageLayout, RouteLink } from '../components';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { getAllHooks, getHookMeta, hasHookDemosArtifacts } from '../utils/hooksLoader';

const HookListScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isNarrow = width < BREAKPOINTS.md;
  const [searchQuery, setSearchQuery] = useState('');
  const artifactsReady = hasHookDemosArtifacts();

  useBrowserTitle(formatPageTitle('Hooks'));

  // Flatten meta onto each entry once, with a prebuilt haystack for search.
  const hooks = useMemo(
    () =>
      getAllHooks().map(entry => {
        const meta = getHookMeta(entry.name) || {};
        const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];
        return {
          name: entry.name,
          title: meta.title || entry.title || entry.name,
          description: meta.description,
          tags,
          haystack: [entry.name, entry.title, entry.description, meta.description, meta.category, meta.status, ...tags]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        };
      }),
    []
  );

  const filteredHooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? hooks.filter(hook => hook.haystack.includes(query)) : hooks;
  }, [hooks, searchQuery]);

  return (
    <PageLayout
      style={{ flex: 1 }}
      // See ComponentListScreen: PageLayout supplies the gutter on narrow
      // viewports, so the inset here is only for wide ones.
      contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: isNarrow ? 0 : 16 }}
    >
      <Column gap="lg">
        <Column gap="xs">
          <Title order={1} size={40} weight="bold">
            Hooks
          </Title>
          <Text variant="p" color="secondary">
            Browse reusable utilities for keyboard shortcuts, theming, clipboard helpers, and more. Select a hook to view dedicated examples and code snippets generated from the source.
          </Text>
        </Column>

        <Search
          placeholder="Search hooks..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {!artifactsReady && (
          <Card>
            <Text variant="p" color="muted">
              Hook documentation artifacts are missing. Run <Text variant="p" weight="semibold">npm run demos:generate</Text> to regenerate metadata and example bundles.
            </Text>
          </Card>
        )}

        {filteredHooks.length === 0 ? (
          <Card>
            <Text variant="p" color="muted" align="center">
              No hooks match "{searchQuery}".
            </Text>
          </Card>
        ) : (
          <Grid columns={{ base: 1, md: 2, xl: 3 }} gap="md" fullWidth>
            {filteredHooks.map(hook => (
              <GridItem key={hook.name} span={1}>
                {/* See ComponentListScreen: the card has to emit a real href so the
                    hook detail pages are reachable without the sitemap. */}
                <RouteLink
                  href={`/hooks/${hook.name}`}
                  style={{ height: '100%' }}
                  accessibilityLabel={hook.title}
                >
                  <Card h="100%">
                    <Column gap="xs">
                      <Title order={2} size={18} weight="600">
                        {hook.title}
                      </Title>
                      {hook.description ? (
                        <Text variant="small" color="secondary">
                          {hook.description}
                        </Text>
                      ) : null}
                      {hook.tags.length > 0 && (
                        <Row wrap="wrap" gap="xs">
                          {hook.tags.map(tag => (
                            <Chip key={tag} size="xs" variant="subtle">
                              {tag}
                            </Chip>
                          ))}
                        </Row>
                      )}
                    </Column>
                  </Card>
                </RouteLink>
              </GridItem>
            ))}
          </Grid>
        )}
      </Column>
    </PageLayout>
  );
};

export default HookListScreen;
