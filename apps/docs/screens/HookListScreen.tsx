import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useBreakpoint, Title, Text, Chip, Column, Divider, Icon, Search, useHover, useTheme } from '@plocks/ui';
import { PageLayout, RouteLink } from '../components';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { getAllHooks, getHookMeta, hasHookDemosArtifacts } from '../utils/hooksLoader';

/** Section order and headings on the hooks index; unknown categories follow, A–Z. */
const CATEGORY_LABELS: Record<string, string> = {
  state: 'State',
  layout: 'Layout & responsive',
  theme: 'Theme',
  styling: 'Styling',
  keyboard: 'Keyboard',
  accessibility: 'Accessibility',
  localization: 'Localization',
  overlay: 'Overlays',
  navigation: 'Navigation',
  forms: 'Forms',
  input: 'Input',
  gestures: 'Gestures',
  feedback: 'Feedback',
  platform: 'Platform',
  utilities: 'Utilities',
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const categoryLabel = (category: string) =>
  CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);

interface HookListItem {
  name: string;
  title: string;
  description?: string;
  tags: string[];
}

/** One linked row, with the hook's use case visible before opening its page. */
const HookRow: React.FC<{ hook: HookListItem; narrow: boolean }> = ({ hook, narrow }) => {
  const theme = useTheme();
  const [hovered, hoverHandlers] = useHover();

  return (
    <RouteLink
      href={`/hooks/${hook.name}`}
      accessibilityLabel={hook.title}
      onHoverIn={hoverHandlers.onHoverIn}
      onHoverOut={hoverHandlers.onHoverOut}
    >
      <View style={[styles.hookRow, narrow && styles.hookRowNarrow, hovered && { backgroundColor: theme.backgrounds.subtle }]}>
        <View style={styles.iconCell}>
          <Icon name="hook" size={18} color={hovered ? theme.text.link : theme.text.muted} decorative />
        </View>
        <View style={styles.hookInfo}>
          <View style={styles.titleLine}>
            <Text variant="p" fw="medium" c={hovered ? theme.text.link : theme.text.primary}>
              {hook.title}
            </Text>
            {hook.tags.map(tag => (
              <Chip key={tag} size="xs" variant="surface">
                {tag.replace(/-/g, ' ')}
              </Chip>
            ))}
          </View>
          {hook.description ? (
            <Text variant="small" c="secondary" numberOfLines={2}>
              {hook.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionCell}>
          {!narrow && <Text variant="small" c={hovered ? theme.text.link : theme.text.muted}>View hook</Text>}
          <Icon name="chevron-right" size="xs" color={hovered ? theme.text.link : theme.text.muted} decorative />
        </View>
      </View>
    </RouteLink>
  );
};

const HookListScreen: React.FC = () => {
  const breakpoint = useBreakpoint();
  const isNarrow = breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm';
  const [searchQuery, setSearchQuery] = useState('');
  const artifactsReady = hasHookDemosArtifacts();

  useBrowserTitle(formatPageTitle('Hooks'));

  // Flatten meta onto each entry once, with a prebuilt haystack for search.
  const hooks = useMemo(
    () =>
      getAllHooks().map(entry => {
        const meta = getHookMeta(entry.name) || {};
        const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];
        const category = typeof meta.category === 'string' && meta.category ? meta.category : 'utilities';
        return {
          name: entry.name,
          category,
          title: meta.title || entry.title || entry.name,
          description: typeof meta.description === 'string' ? meta.description.replace(/`/g, '') : entry.description,
          // The heading already supplies the category; keep the chips for what
          // differentiates this hook from its neighbors.
          tags: tags.filter(tag => tag.toLowerCase() !== category.toLowerCase()).slice(0, 3),
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

  // One section per category, in CATEGORY_ORDER; hooks keep their meta order within it.
  const sections = useMemo(() => {
    const byCategory = new Map<string, typeof filteredHooks>();
    for (const hook of filteredHooks) {
      const list = byCategory.get(hook.category) ?? [];
      list.push(hook);
      byCategory.set(hook.category, list);
    }
    const rank = (category: string) => {
      const index = CATEGORY_ORDER.indexOf(category);
      return index === -1 ? CATEGORY_ORDER.length : index;
    };
    return [...byCategory.entries()]
      .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
      .map(([category, list]) => ({ category, hooks: list }));
  }, [filteredHooks]);

  return (
    <PageLayout
      style={{ flex: 1 }}
      // See ComponentListScreen: PageLayout supplies the gutter on narrow
      // viewports, so the inset here is only for wide ones.
      contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: isNarrow ? 0 : 16 }}
    >
      <Column gap="lg">
        <Column gap="xs">
          <Title order={1} size={40} fw="bold">
            Hooks
          </Title>
          <Text variant="p" c="secondary">
            Compare hooks by what they do, then open one for examples and API details.
          </Text>
        </Column>

        <Search
          placeholder="Search hooks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {!artifactsReady && (
          <Text variant="p" c="muted">
            Hook documentation artifacts are missing. Run <Text variant="p" fw="semibold">npm run demos:generate</Text> to regenerate metadata and example bundles.
          </Text>
        )}

        {filteredHooks.length === 0 ? (
          <Text variant="p" c="muted" ta="center">
            No hooks match "{searchQuery}".
          </Text>
        ) : (
          <Column gap="xl">
            {sections.map(section => (
              <View key={section.category}>
                <View style={styles.sectionHeading}>
                  <Title order={2} size={22} fw="600">
                    {categoryLabel(section.category)}
                  </Title>
                  <Text variant="small" c="muted">{section.hooks.length}</Text>
                </View>
                {section.hooks.map((hook, index) => (
                  <View key={hook.name}>
                    {index > 0 && <Divider />}
                    <HookRow hook={hook} narrow={isNarrow} />
                  </View>
                ))}
              </View>
            ))}
          </Column>
        )}
      </Column>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  hookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  hookRowNarrow: {
    gap: 10,
  },
  iconCell: {
    width: 28,
    alignItems: 'center',
  },
  hookInfo: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 4,
  },
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minWidth: 18,
  },
});

export default HookListScreen;
