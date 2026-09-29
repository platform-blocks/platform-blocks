// TODO: refactor this to programatically generate from chart docs metadata

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { GlobalChartsRoot } from '@platform-blocks/charts';
import { DocsPage } from '../../components/DocsPage';
import { RouteLink } from '../../components/RouteLink';
import { Text, Flex, Card, Tabs, Icon, Skeleton, useHover, useTheme } from '@platform-blocks/ui';
import type { TabItem } from '@platform-blocks/ui';
import { CHART_CATEGORIES, CHART_CATEGORY_ORDER, getAllChartDocs, getChartsByCategory, type ChartDocEntry, type ChartCategoryKey } from '../../config/charts';
import { hasNewDemosArtifacts, getNewDemos, loadDemoComponentNew } from '../../utils/demosLoader';
import { DOCS_CHART_INTERACTION_CONFIG } from '../../config/chartInteraction';
import { useBrowserTitle, formatPageTitle } from '../../hooks/useBrowserTitle';

/** Height held for a preview while its demo loads, so the grid doesn't jump. */
const PREVIEW_PLACEHOLDER_HEIGHT = 260;

interface ChartDemoInfo {
  count: number;
  /** The chart's lead demo — first in authored order — shown as the card's preview. */
  previewId?: string;
}

interface ChartCardProps {
  chart: ChartDocEntry;
  demo: ChartDemoInfo;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingBottom: 12,
    gap: 12,
  },
  tabsContainer: {
    flex: 1,
  },
  categoryWrapper: {
    paddingBottom: 20,
    gap: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    // Two across once there's room for charts to breathe, one below that.
    flexBasis: 420,
    flexGrow: 1,
    // RN defaults this to 0, which would hold the basis past a phone's width.
    flexShrink: 1,
    minWidth: 0,
  },
  preview: {
    flex: 1,
    width: '100%',
    // Short charts (sparklines) sit in the middle of a row sized by its tallest.
    justifyContent: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
});

/**
 * Demo components already resolved, so switching back to a tab renders its
 * charts straight away instead of flashing the placeholders again.
 */
const loadedPreviews = new Map<string, React.ComponentType>();

const ChartPreview = ({ slug, demoId }: { slug: string; demoId: string }) => {
  const key = `${slug}.${demoId}`;
  const [Demo, setDemo] = useState<React.ComponentType | null>(() => loadedPreviews.get(key) ?? null);

  useEffect(() => {
    if (Demo) return;
    let cancelled = false;
    loadDemoComponentNew(slug, demoId)
      .then((mod) => {
        if (!mod) return;
        loadedPreviews.set(key, mod);
        // Updater form: handing a component straight to the setter would have
        // React call it as a state updater.
        if (!cancelled) setDemo(() => mod);
      })
      .catch(() => { /* leave the placeholder up */ });
    return () => { cancelled = true; };
  }, [Demo, key, slug, demoId]);

  if (!Demo) {
    return <Skeleton h={PREVIEW_PLACEHOLDER_HEIGHT} w="100%" radius="md" />;
  }

  return (
    <GlobalChartsRoot
      // Charts size themselves from this box; `alignItems` centres the ones that
      // cap their width (radial charts).
      style={{ width: '100%', alignItems: 'center' }}
      config={DOCS_CHART_INTERACTION_CONFIG}
    >
      <Demo />
    </GlobalChartsRoot>
  );
};

/** Quiet way through to the chart's page: muted until hovered. */
const ChartPageLink = ({ chart, demoCount }: { chart: ChartDocEntry; demoCount: number }) => {
  const theme = useTheme();
  const [hovered, hoverHandlers] = useHover();
  const color = hovered ? theme.text.link : theme.text.muted;

  return (
    <RouteLink
      href={`/charts/${chart.slug}`}
      accessibilityLabel={`${chart.title} docs and examples`}
      onHoverIn={hoverHandlers.onHoverIn}
      onHoverOut={hoverHandlers.onHoverOut}
    >
      <Flex direction="row" align="center" gap={4}>
        <Text size="xs" c={color}>
          {demoCount > 1 ? `${demoCount} examples` : 'Docs'}
        </Text>
        <Icon name="arrow-right" size={12} color={color} />
      </Flex>
    </RouteLink>
  );
};

const ChartCard = ({ chart, demo }: ChartCardProps) => (
  <Card p={16} style={styles.card}>
    <Flex direction="column" gap={16} style={{ flex: 1 }}>
      <Flex direction="row" align="center" justify="space-between" gap={12} style={{ width: '100%' }}>
        <Text size="md" fw="semibold">{chart.title}</Text>
        <ChartPageLink chart={chart} demoCount={demo.count} />
      </Flex>
      <View style={styles.preview}>
        {demo.previewId ? (
          <ChartPreview slug={chart.slug} demoId={demo.previewId} />
        ) : (
          <Text size="sm" c="muted">{chart.summary}</Text>
        )}
      </View>
    </Flex>
  </Card>
);

export default function ChartsScreen() {
  useBrowserTitle(formatPageTitle('Charts'));

  const allCharts = useMemo(() => getAllChartDocs(), []);
  const chartsByCategory = useMemo(() => getChartsByCategory(), []);
  const demosReady = hasNewDemosArtifacts();

  const demoInfo = useMemo(() => {
    if (!demosReady) return {} as Record<string, ChartDemoInfo>;
    return allCharts.reduce<Record<string, ChartDemoInfo>>((acc, chart) => {
      const demos = getNewDemos(chart.slug);
      acc[chart.slug] = { count: demos.length, previewId: demos[0]?.id };
      return acc;
    }, {});
  }, [allCharts, demosReady]);

  const tabItems: TabItem[] = useMemo(() => CHART_CATEGORY_ORDER.map((categoryKey: ChartCategoryKey) => {
    const meta = CHART_CATEGORIES[categoryKey];
    const charts = chartsByCategory[categoryKey] ?? [];
    return {
      key: categoryKey,
      label: (
        <Flex direction="row" align="center" gap={8}>
          <Icon name={meta.icon as any} size={16} />
          <Text size="sm" fw="medium">{meta.label}</Text>
        </Flex>
      ),
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.categoryWrapper}>
            <Text size="sm" c="muted">{meta.description}</Text>
            {charts.length > 0 ? (
              <View style={styles.cardsGrid}>
                {charts.map((chart: ChartDocEntry) => (
                  <ChartCard
                    key={chart.slug}
                    chart={chart}
                    demo={demoInfo[chart.slug] ?? { count: 0 }}
                  />
                ))}
              </View>
            ) : (
              <Card variant="outline" style={styles.emptyState}>
                <Text size="sm" c="muted">
                  No charts available in this category yet.
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
      ),
    } as TabItem;
  }), [chartsByCategory, demoInfo]);

  return (
    <DocsPage>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text variant="h1">Charts</Text>
          <Text size="lg" c="muted">
            Explore {allCharts.length} production-ready visualisations powered by <Text size="lg" fw="semibold">@platform-blocks/charts</Text>.
          </Text>
        </View>
        <Tabs
          items={tabItems}
          variant="line"
          size="md"
          style={styles.tabsContainer}
          // Tabs pads its panel on all four sides; drop the horizontal half so
          // the cards sit on the same column as the page heading above them.
          contentStyle={{ paddingHorizontal: 0 }}
        />
      </View>
    </DocsPage>
  );
}
