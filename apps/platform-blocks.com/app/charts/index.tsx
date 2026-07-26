// TODO: refactor this to programatically generate from chart docs metadata

import React, { useMemo, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PageLayout } from '../../components/PageLayout';
import { RouteLink } from '../../components/RouteLink';
import { Text, Flex, Card, Tabs, Icon, Button, Chip } from '@platform-blocks/ui';
import type { TabItem } from '@platform-blocks/ui';
import { CHART_CATEGORIES, CHART_CATEGORY_ORDER, getAllChartDocs, getChartsByCategory, type ChartDocEntry, type ChartCategoryKey } from '../../config/charts';
import { hasNewDemosArtifacts, getNewDemos } from '../../utils/demosLoader';
import { useBrowserTitle, formatPageTitle } from '../../hooks/useBrowserTitle';

interface ChartCategorySectionProps {
  charts: ChartDocEntry[];
  onExplore: (slug: string) => void;
  demoCounts: Record<string, number>;
  demosReady: boolean;
}

interface ChartCardProps {
  chart: ChartDocEntry;
  demoCount: number;
  demosReady: boolean;
  onExplore: (slug: string) => void;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    padding: 20,
    paddingBottom: 12,
    gap: 12,
  },
  tabsContainer: {
    flex: 1,
  },
  categoryWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    minHeight: 220,
    flexBasis: 280,
    flexGrow: 1,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
});

const ChartCard = ({ chart, demoCount, demosReady, onExplore }: ChartCardProps) => (
  <Card p={20} style={styles.card}>
    <Flex direction="column" gap={16} style={{ flex: 1 }}>
      {/* The anchor wraps the heading block rather than the whole card: `Button`
          renders a real <button> on web, and a button nested inside a link is
          invalid HTML that browsers repair by splitting the anchor. Keeping the
          link over inert content leaves one valid, crawlable href per card. */}
      <RouteLink href={`/charts/${chart.slug}`} accessibilityLabel={chart.title}>
        <Flex direction="row" align="center" gap={12}>
          <View style={styles.iconBadge}>
            <Icon name={chart.icon as any} size={28} />
          </View>
          <Flex direction="column" gap={4} style={{ flex: 1 }}>
            <Text size="md" weight="semibold">{chart.title}</Text>
            <Text size="sm" color="muted">{chart.summary}</Text>
          </Flex>
        </Flex>
      </RouteLink>
      {chart.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {chart.tags.slice(0, 4).map((tag: string) => (
            <Chip key={tag} size="xs" variant="light">
              {tag}
            </Chip>
          ))}
        </View>
      )}
      <Flex direction="row" justify="space-between" align="center" style={{ marginTop: 'auto' }}>
        <Button
          title="View details"
          size="sm"
          variant="outline"
          onPress={() => onExplore(chart.slug)}
        />
        {demoCount > 0 ? (
          <Chip size="xs" variant="filled">
            {demoCount} demo{demoCount === 1 ? '' : 's'}
          </Chip>
        ) : (
          <Text size="xs" color="muted">
            {demosReady ? 'No demos yet' : 'Demos pending build'}
          </Text>
        )}
      </Flex>
    </Flex>
  </Card>
);

const ChartCategorySection = ({ charts, onExplore, demoCounts, demosReady }: ChartCategorySectionProps) => (
  <Flex direction="column" gap={20}>
    <View style={styles.cardsGrid}>
      {charts.map((chart: ChartDocEntry) => (
        <ChartCard
          key={chart.slug}
          chart={chart}
          demoCount={demoCounts[chart.slug] ?? 0}
          demosReady={demosReady}
          onExplore={onExplore}
        />
      ))}
    </View>
  </Flex>
);

export default function ChartsScreen() {
  const router = useRouter();
  useBrowserTitle(formatPageTitle('Charts'));

  const allCharts = useMemo(() => getAllChartDocs(), []);
  const chartsByCategory = useMemo(() => getChartsByCategory(), []);
  const demosReady = hasNewDemosArtifacts();

  const demoCounts = useMemo(() => {
    if (!demosReady) return {} as Record<string, number>;
    return allCharts.reduce<Record<string, number>>((acc, chart) => {
      acc[chart.slug] = getNewDemos(chart.slug).length;
      return acc;
    }, {});
  }, [allCharts, demosReady]);

  const handleExplore = useCallback((slug: string) => {
    router.push(`/charts/${slug}`);
  }, [router]);

  const tabItems: TabItem[] = useMemo(() => CHART_CATEGORY_ORDER.map((categoryKey: ChartCategoryKey) => {
    const meta = CHART_CATEGORIES[categoryKey];
    const charts = chartsByCategory[categoryKey] ?? [];
    return {
      key: categoryKey,
      label: (
        <Flex direction="row" align="center" gap={8}>
          <Icon name={meta.icon as any} size={16} />
          <Text size="sm" weight="medium">{meta.label}</Text>
        </Flex>
      ),
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.categoryWrapper}>
            <Text size="sm" color="muted">{meta.description}</Text>
            {charts.length > 0 ? (
              <ChartCategorySection
                charts={charts}
                demoCounts={demoCounts}
                demosReady={demosReady}
                onExplore={handleExplore}
              />
            ) : (
              <Card variant="outline" style={styles.emptyState}>
                <Text size="sm" color="muted">
                  No charts available in this category yet.
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
      ),
    } as TabItem;
  }), [chartsByCategory, demoCounts, demosReady, handleExplore]);

  return (
    <PageLayout>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text variant="h1">Charts</Text>
          <Text size="lg" color="muted">
            Explore {allCharts.length} production-ready visualisations powered by <Text size="lg" weight="semibold">@platform-blocks/charts</Text>.
          </Text>
        </View>
        <Tabs
          items={tabItems}
          variant="line"
          size="md"
          style={styles.tabsContainer}
        />
      </View>
    </PageLayout>
  );
}
