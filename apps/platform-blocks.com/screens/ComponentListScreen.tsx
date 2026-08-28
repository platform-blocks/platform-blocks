import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, Card, Chip, Column, Icon, Row, Grid, GridItem, Title, Search } from '@platform-blocks/ui';
import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { PageLayout, RouteLink } from '../components';
// Using new demos system exclusively
import { getAllNewComponents, hasNewDemosArtifacts } from '../utils/demosLoader';
import {
  getCoreComponentConfig,
  isCoreComponent,
  getCoreCategories,
  CATEGORY_ICONS
} from '../config/coreComponents';

// Grid columns responsive map: base=1, sm=2, lg=3, xl=4
const GRID_COLUMNS = { base: 1, sm: 2, lg: 3, xl: 4 } as const;

export default function ComponentListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < BREAKPOINTS.md;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Set browser title
  useBrowserTitle(formatPageTitle('Components'));

  // Get components from the new loader - filter to only show core components
  const allComponents = getAllNewComponents().filter(component => isCoreComponent(component.name));
  const demosReady = hasNewDemosArtifacts();

  // Read query params reactively from the router so filters apply on soft
  // navigations (e.g. from the home page category buttons), not just hard loads.
  const params = useLocalSearchParams<{ category?: string | string[]; componentName?: string | string[] }>();
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const componentNameParam = Array.isArray(params.componentName) ? params.componentName[0] : params.componentName;
  const legacyNavigationHandledRef = useRef(false);

  // Redirect legacy `?componentName=` deep links to the detail route.
  useEffect(() => {
    if (componentNameParam && !legacyNavigationHandledRef.current) {
      legacyNavigationHandledRef.current = true;
      router.push(`/components/${componentNameParam}`);
    }
  }, [componentNameParam, router]);

  // Sync the selected category from the URL query. Runs whenever the query
  // changes, so navigating to /components?category=display applies the filter.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing state from the URL (external system)
    setSelectedCategory(categoryParam ? categoryParam.toLowerCase() : null);
  }, [categoryParam]);

  const handleCategoryFilter = (category: string | null) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    // Keep the URL query in sync via the router so the param stays the source
    // of truth (and useLocalSearchParams reflects it).
    router.setParams({ category: newCategory ?? undefined });
  };

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allComponents.filter((component) => {
      const coreConfig = getCoreComponentConfig(component.name);
      if (!coreConfig) return false; // Skip if not a core component

      const matchesSearch = query === '' ||
        component.name.toLowerCase().includes(query) ||
        (component.description && component.description.toLowerCase().includes(query));

      return matchesSearch && (selectedCategory === null || coreConfig.category === selectedCategory);
    });
  }, [allComponents, searchQuery, selectedCategory]);

  const categoryFilters = [
    { label: 'All', value: null },
    ...getCoreCategories().map(category => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value: category,
    })),
  ];

  return (
    <PageLayout
      // Narrow viewports take their gutter from PageLayout; stacking a second
      // one here inset the page by 36px per side. Wide ones get no gutter from
      // PageLayout, so the inset is this page's to supply — 16px, the same
      // content column every other docs page sits in.
      contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: isNarrow ? 0 : 16 }}
    >
      <Column gap="lg">
        <Column gap="xs">
          <Title
            variant="h1"
            weight="bold"
            action={
              <Search
                placeholder="Search components..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            }
          >
            Components
          </Title>
          <Text variant="p" colorVariant="secondary">
            Explore all {allComponents.length} components in the PlatformBlocks library
          </Text>
        </Column>

        {/* One accent for the active filter, neutral for the rest — no rainbow. */}
        <Row wrap="wrap" gap="xs">
          {categoryFilters.map(filter => {
            const active = selectedCategory === filter.value;
            return (
              <Chip
                key={filter.value ?? 'all'}
                size="sm"
                variant={active ? 'filled' : 'outline'}
                color={active ? 'primary' : 'gray'}
                onPress={() => handleCategoryFilter(filter.value)}
              >
                {filter.label}
              </Chip>
            );
          })}
        </Row>

        <Text variant="small" colorVariant="muted">
          {filteredComponents.length} components
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory && ` in ${selectedCategory}`}
        </Text>

        {!demosReady && (
          <Card p="xl">
            <Column gap="xs">
              <Text variant="p" colorVariant="muted" align="center">
                Component demos haven&apos;t been generated yet for this build.
              </Text>
              <Text variant="small" colorVariant="secondary" align="center">
                Run <Text variant="small" weight="bold">npm run demos:generate</Text> before building to include metadata and demo modules.
              </Text>
            </Column>
          </Card>
        )}

        {filteredComponents.length === 0 ? (
          <Card p="xl">
            <Text variant="p" colorVariant="muted" align="center">
              No components found matching your criteria.
            </Text>
          </Card>
        ) : (
          <Grid columns={GRID_COLUMNS} gap="md" fullWidth>
            {filteredComponents.map((component) => {
              const coreConfig = getCoreComponentConfig(component.name);
              const category = coreConfig?.category || (component as any).category;
              // Catalog icons stay monochrome — color is reserved for semantic
              // state and the single brand accent, so the grid reads as one system.
              const icon = coreConfig?.icon || CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || 'star';

              return (
                <GridItem key={component.name} span={1}>
                  {/* RouteLink, not `Card onPress` — the card grid is how both readers
                      and crawlers reach the 117 detail pages, and a Pressable emits no
                      href for them to follow. */}
                  <RouteLink
                    href={`/components/${component.name}`}
                    style={{ height: '100%' }}
                    accessibilityLabel={component.name}
                  >
                    <Card h="100%">
                      <Row gap="md" align="center">
                        <Icon name={icon as any} size={40} />
                        <Column gap="xs" align="flex-start">
                          <Text variant="h2" weight="600">
                            {component.name}
                          </Text>
                          {/* Neutral category badge; the label carries the meaning. */}
                          <Chip variant="light" color="gray" size="xs">
                            {category}
                          </Chip>
                        </Column>
                      </Row>
                    </Card>
                  </RouteLink>
                </GridItem>
              );
            })}
          </Grid>
        )}
      </Column>
    </PageLayout>
  );
}
