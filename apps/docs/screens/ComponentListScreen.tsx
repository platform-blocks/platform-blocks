import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Text,
  Card,
  Chip,
  Column,
  Divider,
  Icon,
  Row,
  Title,
  Search,
  useHover,
  useTheme,
  useBreakpoint,
} from '@plocks/ui';
import { View, type DimensionValue, type LayoutChangeEvent } from 'react-native';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { PageLayout, RouteLink } from '../components';
import { PackageInstallCommand } from '../components/PackageInstallCommand';
// Using new demos system exclusively
import { getAllNewComponents, hasNewDemosArtifacts } from '../utils/demosLoader';
import { componentRoute } from '../utils/componentRoute';
import {
  getCoreComponentConfig,
  isCoreComponent,
  getCoreCategories,
  CATEGORY_ICONS
} from '../config/coreComponents';

/** Gap between category cards, in px — also the basis for the card-width math. */
const CARD_GAP = 12;
/** Narrowest a component row can get before the card drops an inner column. */
const MIN_ITEM_WIDTH = 168;
/** Inner columns never exceed this, so a full-width card doesn't turn into a table. */
const MAX_ITEM_COLUMNS = 4;
/**
 * What a category card costs beyond its rows — header, divider, padding —
 * expressed in row-equivalents, so the balancer can compare a card of 3 items
 * against a card of 25.
 */
const CARD_HEADER_WEIGHT = 2.5;

interface CatalogItem {
  name: string;
  icon: string;
}

interface CategoryGroup {
  key: string;
  label: string;
  icon: string;
  items: CatalogItem[];
  packageName?: string;
}

/**
 * Spreads the category cards over `columnCount` columns, always appending to the
 * column that is currently shortest.
 *
 * The cards are different heights — `input` holds 27 components, `overlay` 5 —
 * so handing them to a plain grid leaves every row padded out to its tallest
 * card. Walking them in order and filling the shortest column keeps the reading
 * order roughly left-to-right while ending the columns within a row or two of
 * each other.
 */
function distributeGroups(
  groups: CategoryGroup[],
  columnCount: number,
  itemColumns: number
): CategoryGroup[][] {
  const columns: { weight: number; groups: CategoryGroup[] }[] = Array.from(
    { length: columnCount },
    () => ({ weight: 0, groups: [] })
  );

  groups.forEach(group => {
    // `reduce` keeps the first minimum, so ties fall to the leftmost column.
    const target = columns.reduce((shortest, column) =>
      column.weight < shortest.weight ? column : shortest
    );
    target.groups.push(group);
    // Rows, not items: a 25-item card is 13 rows tall once its items sit in two
    // tracks, and weighing it as 25 would push the whole column out of balance.
    target.weight += Math.ceil(group.items.length / itemColumns) + CARD_HEADER_WEIGHT;
  });

  return columns.map(column => column.groups);
}

/** How many component tracks fit in a card `cardWidth` px wide. */
function itemColumnsFor(cardWidth: number): number {
  const usable = cardWidth - 16; // Card padding, both sides
  return Math.max(1, Math.min(MAX_ITEM_COLUMNS, Math.floor(usable / MIN_ITEM_WIDTH)));
}

/**
 * One component in a category card: an icon, a name, and a hover surface.
 *
 * Its own component so each row owns its hover state — 125 of these share the
 * page, and lifting the state would re-render the whole catalog on every
 * pointer move.
 */
const ComponentRow: React.FC<{ item: CatalogItem; width: DimensionValue }> = ({ item, width }) => {
  const theme = useTheme();
  const [hovered, hoverHandlers] = useHover();
  const accent = hovered ? theme.text.link : undefined;

  return (
    <RouteLink
      // RouteLink, not `Card onPress` — the catalog is how both readers and
      // crawlers reach the 125 detail pages, and a Pressable emits no href for
      // them to follow.
      href={componentRoute(item.name)}
      accessibilityLabel={item.name}
      style={{ width }}
      onHoverIn={hoverHandlers.onHoverIn}
      onHoverOut={hoverHandlers.onHoverOut}
    >
      <Row
        align="center"
        gap={8}
        px={8}
        py={6}
        style={{
          borderRadius: 6,
          backgroundColor: hovered ? theme.backgrounds.subtle : 'transparent',
        }}
      >
        <Icon name={item.icon as any} size={15} color={accent ?? theme.text.muted} />
        <Text
          variant="small"
          size={13}
          fw="500"
          numberOfLines={1}
          c={accent ?? theme.text.primary}
          style={{ flex: 1 }}
        >
          {item.name}
        </Text>
      </Row>
    </RouteLink>
  );
};

/** A category as a card: header, rule, then its components in `itemColumns` tracks. */
const CategoryCard: React.FC<{ group: CategoryGroup; itemColumns: number }> = ({
  group,
  itemColumns,
}) => {
  const theme = useTheme();
  // Percentage tracks with no gap on the wrapping row: the hover surface fills
  // its cell and the padding inside the row supplies the visual gutter, so the
  // tracks never overflow the way `width: 50%` plus a gap would.
  const itemWidth = `${100 / itemColumns}%` as DimensionValue;

  return (
    <Card p="sm" radius="lg">
      <Column gap={6}>
        <Row align="center" justify="space-between" gap="xs" px={8} style={{ width: '100%' }}>
          <Row align="center" gap={8} shrink={1}>
            <Icon name={group.icon as any} size={15} color={theme.text.secondary} />
            {/* An `h2` per category: the page's outline is now eleven category
                headings rather than 125 component names. */}
            <Text variant="h2" size={12} fw="600" tt={group.packageName && group.key !== 'charts' ? undefined : 'uppercase'} lts={group.packageName && group.key !== 'charts' ? 0 : 0.6} c="secondary">
              {group.label}
            </Text>
          </Row>
          <Text variant="small" size={12} c="muted">
            {group.items.length}
          </Text>
        </Row>
        <Divider />
        {group.packageName && (
          <View style={{ paddingHorizontal: 8 }}>
            <PackageInstallCommand packageName={group.packageName} compact />
          </View>
        )}
        <Row wrap="wrap" gap={0} style={{ width: '100%' }}>
          {group.items.map(item => (
            <ComponentRow key={item.name} item={item} width={itemWidth} />
          ))}
        </Row>
      </Column>
    </Card>
  );
};

export default function ComponentListScreen() {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const isNarrow = breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Measured rather than derived from the window: the docs sidebar takes a
  // chunk of the viewport, so only the catalog itself knows how wide a card
  // actually lands.
  const [catalogWidth, setCatalogWidth] = useState(0);

  // Set browser title
  useBrowserTitle(formatPageTitle('Components'));

  // Get components from the new loader - filter to only show core components.
  // Memoized because the loader hands back a fresh array on every call, and an unstable
  // reference here would defeat every memo downstream of it.
  const allComponents = useMemo(
    () => getAllNewComponents().filter(component => isCoreComponent(component.name)),
    []
  );
  const demosReady = hasNewDemosArtifacts();

  // Read query params reactively from the router so filters apply on soft
  // navigations (e.g. from the home page category buttons), not just hard loads.
  const params = useLocalSearchParams<{ category?: string | string[]; package?: string | string[] }>();
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const packageParam = Array.isArray(params.package) ? params.package[0] : params.package;

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

  const visibleComponents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allComponents.filter(component => {
      const coreConfig = getCoreComponentConfig(component.name);
      if (!coreConfig || (selectedCategory !== null && coreConfig.category !== selectedCategory)) return false;
      if (packageParam && component.packageName !== packageParam) return false;
      return query === '' || component.name.toLowerCase().includes(query) ||
        component.description?.toLowerCase().includes(query);
    });
  }, [allComponents, searchQuery, selectedCategory, packageParam]);

  // The main catalog only contains @plocks/ui components. Charts retain their
  // existing dedicated card; the other packages get their own section below.
  const groups = useMemo<CategoryGroup[]>(() => {
    const byCategory = new Map<string, CatalogItem[]>();

    visibleComponents.forEach(component => {
      const coreConfig = getCoreComponentConfig(component.name);
      if (!coreConfig || (component.packageName !== '@plocks/ui' && coreConfig.category !== 'charts')) return;

      const items = byCategory.get(coreConfig.category) ?? [];
      // Catalog icons stay monochrome — color is reserved for semantic state and
      // the single brand accent, so the page reads as one system.
      items.push({
        name: component.name,
        icon: coreConfig.icon || CATEGORY_ICONS[coreConfig.category] || 'star',
      });
      byCategory.set(coreConfig.category, items);
    });

    // `getCoreCategories` fixes the order the cards appear in; the loader
    // already handed the components over sorted by name.
    return getCoreCategories()
      .filter(category => byCategory.has(category))
      .map(category => ({
        key: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        icon: CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || 'star',
        packageName: category === 'charts' ? '@plocks/charts' : undefined,
        items: byCategory.get(category) as CatalogItem[],
      }));
  }, [visibleComponents]);

  const addonGroups = useMemo<CategoryGroup[]>(() => {
    const byPackage = new Map<string, CatalogItem[]>();
    visibleComponents.forEach(component => {
      const coreConfig = getCoreComponentConfig(component.name);
      if (!coreConfig || coreConfig.category === 'charts' || !component.packageName || component.packageName === '@plocks/ui') return;
      const items = byPackage.get(component.packageName) ?? [];
      items.push({ name: component.name, icon: coreConfig.icon });
      byPackage.set(component.packageName, items);
    });
    return Array.from(byPackage, ([packageName, items]) => ({
      key: packageName,
      label: packageName,
      icon: 'package',
      packageName,
      items,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [visibleComponents]);

  const matchCount = useMemo(
    () => groups.reduce((total, group) => total + group.items.length, 0) +
      addonGroups.reduce((total, group) => total + group.items.length, 0),
    [groups, addonGroups]
  );

  // Charts close the catalog as one full-width card rather than joining the
  // columns. They are its biggest card, and the balancer places cards in
  // order, so a trailing 25-item card would land on whichever column was
  // shortest and leave it running far past the others.
  const chartsGroup = groups.find(group => group.key === 'charts');
  const columnGroups = useMemo(() => groups.filter(group => group.key !== 'charts'), [groups]);

  // Card columns follow the viewport; the count is capped by how many cards
  // there are, so filtering down to one category widens that card instead of
  // stranding it beside three empty tracks.
  const columnCount = useMemo(() => {
    const byViewport = breakpoint === 'xl' ? 4 : breakpoint === 'lg' ? 3 : breakpoint === 'sm' || breakpoint === 'md' ? 2 : 1;
    return Math.max(1, Math.min(byViewport, columnGroups.length));
  }, [breakpoint, columnGroups.length]);

  // A wider card holds more component tracks — the same reason a 4-up catalog
  // reads as a list and a single filtered card reads as a grid.
  const itemColumns = useMemo(() => {
    if (!catalogWidth) return 1;
    return itemColumnsFor((catalogWidth - CARD_GAP * (columnCount - 1)) / columnCount);
  }, [catalogWidth, columnCount]);
  const chartItemColumns = catalogWidth ? itemColumnsFor(catalogWidth) : 1;

  const columns = useMemo(
    () => distributeGroups(columnGroups, columnCount, itemColumns),
    [columnGroups, columnCount, itemColumns]
  );
  const addonColumnCount = useMemo(() => {
    const byViewport = breakpoint === 'xl' || breakpoint === 'lg' ? 3 : breakpoint === 'sm' || breakpoint === 'md' ? 2 : 1;
    return Math.max(1, Math.min(byViewport, addonGroups.length));
  }, [breakpoint, addonGroups.length]);
  const addonColumns = useMemo(
    () => distributeGroups(addonGroups, addonColumnCount, 1),
    [addonGroups, addonColumnCount]
  );

  const handleCatalogLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setCatalogWidth(previous => (Math.abs(previous - nextWidth) > 1 ? nextWidth : previous));
  };

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
      <Column gap="md">
        <Column gap="xs">
          <Title
            variant="h1"
            fw="bold"
            action={
              <Search
                placeholder="Search components..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            }
          >
            Components
          </Title>
          <Text variant="p" c="secondary">
            Explore all {allComponents.length} components. Charts and add-ons ship in separate packages.
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

        {/* The full catalog is already labelled by its cards — only a narrowed
            one needs a count to explain what is missing. */}
        {(searchQuery.trim() !== '' || selectedCategory !== null || !!packageParam) && (
          <Text variant="small" c="muted">
            {matchCount} {matchCount === 1 ? 'component' : 'components'}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
            {packageParam && ` in ${packageParam}`}
          </Text>
        )}

        {!demosReady && (
          <Card p="xl">
            <Column gap="xs">
              <Text variant="p" c="muted" ta="center">
                Component demos haven&apos;t been generated yet for this build.
              </Text>
              <Text variant="small" c="secondary" ta="center">
                Run <Text variant="small" fw="bold">npm run demos:generate</Text> before building to include metadata and demo modules.
              </Text>
            </Column>
          </Card>
        )}

        {groups.length === 0 && addonGroups.length === 0 ? (
          <Card p="xl">
            <Text variant="p" c="muted" ta="center">
              No components found matching your criteria.
            </Text>
          </Card>
        ) : (
          <View onLayout={handleCatalogLayout} style={{ gap: CARD_GAP, width: '100%' }}>
            {columnGroups.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: CARD_GAP, width: '100%' }}>
                {columns.map((cardsInColumn, index) => (
                  // `stretch`, or a column holding one short card lets that card
                  // shrink to its text and break the grid's alignment.
                  <Column key={index} gap={CARD_GAP} align="stretch" style={{ flex: 1, minWidth: 0 }}>
                    {cardsInColumn.map(group => (
                      <CategoryCard key={group.key} group={group} itemColumns={itemColumns} />
                    ))}
                  </Column>
                ))}
              </View>
            )}
            {chartsGroup && <CategoryCard group={chartsGroup} itemColumns={chartItemColumns} />}
            {addonGroups.length > 0 && (
              <Column gap="sm" mt="md">
                <Title order={2} size="lg">Add-on packages</Title>
                <Text size="sm" c="secondary">Install the package shown on each card before using its components.</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: CARD_GAP, width: '100%' }}>
                  {addonColumns.map((cardsInColumn, index) => (
                    <Column key={index} gap={CARD_GAP} align="stretch" style={{ flex: 1, minWidth: 0 }}>
                      {cardsInColumn.map(group => (
                        <CategoryCard key={group.key} group={group} itemColumns={1} />
                      ))}
                    </Column>
                  ))}
                </View>
              </Column>
            )}
          </View>
        )}
      </Column>
    </PageLayout>
  );
}
