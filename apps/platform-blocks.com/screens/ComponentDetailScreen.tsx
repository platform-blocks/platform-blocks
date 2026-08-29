import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card, Flex, Loader, Tabs, Markdown, useI18n, TableOfContents, Link, Block } from '@platform-blocks/ui';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import { GlobalChartsRoot } from '@platform-blocks/charts';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { useFragmentScroll } from '../hooks/useFragmentScroll';
import { DemoRenderer } from '../components/DemoRenderer';
import { DemoHeading } from '../components/DemoHeading';
import { buildDemoAnchors } from '../utils/demoAnchors';
import { PropTable } from '../components/PropTable';
import { DocsPage } from '../components/DocsPage';
import { DocsPageHeader } from '../components/DocsPageHeader';
import { CopyPageMenu } from '../components/CopyPageMenu';
import { ComponentResourceLinks } from '../components/ComponentResourceLinks';
import { normalizeDescriptionHeadings } from '../config/routeSeo';
import { TryInExpoGoButton } from '../components/TryInExpoGoButton';
import { SnackQRCode } from '../components/SnackQRCode';
import { buildComponentSnackUrl } from '../utils/snackUrl';
import {
  hasNewDemosArtifacts,
  getNewDemos,
  attachDemoCode,
  loadDemoComponentNew,
  getComponentMeta as getNewComponentMeta,
  getComponentProps,
  getComponentMarkdown,
  type ComponentMeta,
  type PlaygroundMeta
} from '../utils/demosLoader';
import { ComponentPlayground } from '../components/playground/ComponentPlayground';
import { getPlaygroundConfig, type ComponentPlaygroundConfig } from '../components/playground/registry';

interface ComponentDetailScreenProps { component?: string }

interface DemoSectionProps {
  demo: any;
  preview: React.ReactNode;
  description?: string;
  hideTitle?: boolean;
  /** Fragment id that deep-links to this demo. */
  anchorId: string;
}

/** Matches the `opacity: 0.7` the page-level description is dimmed with. */
const DEMO_DESCRIPTION_STYLE = { opacity: 0.7 };

function DemoSection({ demo, preview, description, hideTitle, anchorId }: DemoSectionProps) {
  const sectionChildren: React.ReactNode[] = [];

  if (!hideTitle) {
    sectionChildren.push(
      <DemoHeading key="title" id={anchorId}>
        {demo.title}
      </DemoHeading>
    );
  }

  if (description) {
    sectionChildren.push(
      // Same recessed treatment as the component description under the page
      // title, so a demo's blurb reads as support text rather than as content.
      <View key="description" style={DEMO_DESCRIPTION_STYLE}>
        <Markdown>{description}</Markdown>
      </View>
    );
  }

  sectionChildren.push(
    <DemoRenderer key="demo" demo={demo} preview={preview} />
  );

  return (
    // No gap: the heading, description and demo card read as one unit.
    <Block gap={0}>
      {sectionChildren}
    </Block>
  );
}
// Extract content rendering into a separate component for reuse
const DOCS_CHART_INTERACTION_CONFIG = {
  enableCrosshair: true,
  multiTooltip: true,
  liveTooltip: true,
  popoverPortal: true,
  pointerPixelThreshold: 3,
  aggregatorMaxSeries: 8,
};

interface ComponentContentProps {
  component: string;
  newMeta: ComponentMeta | null;
  effectiveDemos: any[];
  hasDemos: boolean;
  hasProps: boolean;
  componentProps: any[];
  loadedDemoComponents: Record<string, React.ComponentType>;
  getLocalizedDescription: (demo: any) => string;
  playgroundMeta: PlaygroundMeta | null;
  playgroundConfig: ComponentPlaygroundConfig | null;
  componentMarkdown: string | null;
  onTabChange?: (tabKey: string) => void;
  /** Render the inline scrollspy TOC below the header (Examples tab, desktop only). */
  showToc?: boolean;
}

/**
 * Cancels the horizontal half of the Tabs panel's own padding, keeping its
 * vertical padding. Deliberately a plain object, not `StyleSheet.create`:
 * `Tabs` builds its panel style from a factory that returns plain objects, so
 * react-native-web applies it as an *inline* style — a registered style here
 * would compile to a class and lose to it.
 */
const TABS_CONTENT_STYLE = { paddingLeft: 0, paddingRight: 0 };

const ComponentContent = React.memo(function ComponentContent({
  component,
  newMeta,
  effectiveDemos,
  hasDemos,
  hasProps,
  componentProps,
  loadedDemoComponents,
  getLocalizedDescription,
  playgroundMeta,
  playgroundConfig,
  componentMarkdown,
  onTabChange,
  showToc,
}: ComponentContentProps) {
  // Every snack-able demo of the component in one Snack — null when none of them
  // can run there. Built once here and shared with the resource links row, since
  // bundling every demo's source is not cheap.
  const snackUrl = React.useMemo(
    () => (effectiveDemos.length ? buildComponentSnackUrl(component, effectiveDemos) : null),
    [component, effectiveDemos]
  );

  // Fragment id per demo, so every example heading is its own permalink.
  const demoAnchors = React.useMemo(() => buildDemoAnchors(effectiveDemos), [effectiveDemos]);

  const tabItems: Array<{ key: string; label: string; content: React.ReactNode; subLabel?: string }> = [];
  const resourceLinks = Array.isArray(newMeta?.resources)
    ? (newMeta?.resources as Array<{ label?: string; href?: string }>).filter((entry) => typeof entry?.href === 'string')
    : [];

  tabItems.push({
    key: 'demos',
    label: 'Examples',
    subLabel: hasDemos ? `(${effectiveDemos.length})` : undefined,
    content: hasDemos ? (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 24 }}>
          {effectiveDemos.map(demo => {
            const DemoComp = loadedDemoComponents[demo.id];
            // Runtime validation to prevent React from trying to render a non-component value
            let preview: React.ReactNode;
            if (DemoComp) {
              const isCallable = typeof DemoComp === 'function';
              if (!isCallable) {
                // Dev-only diagnostic: log once per invalid demo id. Deliberately
                // mutates a global dedup set during render — acceptable for a
                // dev warning that must not spam on every re-render.
                // eslint-disable-next-line react-hooks/immutability -- dev-only log-once diagnostic
                if (!(globalThis as any).__demoInvalidLogged) (globalThis as any).__demoInvalidLogged = new Set();
                const set = (globalThis as any).__demoInvalidLogged as Set<string>;
                if (!set.has(demo.id)) {
                  // eslint-disable-next-line react-hooks/immutability -- dev-only log-once diagnostic
                  set.add(demo.id);
                  // eslint-disable-next-line no-console
                  console.error('[DemoLoader] Loaded demo is not a function component', {
                    id: demo.id,
                    type: typeof DemoComp,
                    value: DemoComp
                  });
                }
                preview = (
                  <Text variant="p" color="error">
                    Demo "{demo.id}" failed: not a component export.
                  </Text>
                );
              } else {
                try {
                  const rendered = <DemoComp />;
                  preview = newMeta?.category === 'charts'
                    ? (
                      <GlobalChartsRoot
                        // Charts declare a fixed width, so the full-width root has to
                        // centre them or every demo hugs the left edge of the card.
                        style={{ width: '100%', alignItems: 'center' }}
                        config={DOCS_CHART_INTERACTION_CONFIG}
                      >
                        {rendered}
                      </GlobalChartsRoot>
                    )
                    : rendered;
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error('[DemoLoader] Error rendering demo', demo.id, err);
                  preview = (
                    <Text variant="p" color="error">
                      Demo "{demo.id}" threw during render.
                    </Text>
                  );
                }
              }
            } else {
              preview = (
                <Flex direction="row" align="center" gap={8}>
                  <Loader size="sm" />
                  <Text variant="p" color="muted">Loading demo…</Text>
                </Flex>
              );
            }
            return (
              <DemoSection
                key={demo.id}
                demo={demo}
                preview={preview}
                description={getLocalizedDescription(demo)}
                hideTitle={newMeta?.category === 'charts'}
                anchorId={demoAnchors[demo.id]}
              />
            );
          })}
        </View>
      </ScrollView>
    ) : (
      <Card style={{ padding: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>No examples available for this component.</Text>
      </Card>
    )
  });

  tabItems.push({
    key: 'props',
    label: 'Properties',
    subLabel: hasProps ? `(${componentProps.length})` : undefined,
    content: hasProps ? <PropTable props={componentProps} /> : (
      <Card style={{ padding: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>No documented props yet.</Text>
      </Card>
    )
  });

  if (playgroundMeta) {
    tabItems.push({
      key: 'playground',
      label: playgroundMeta.label || 'Playground',
      content: (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16 }}>
            {playgroundMeta.description && (
              <Markdown>{playgroundMeta.description}</Markdown>
            )}
            {playgroundConfig ? (
              <ComponentPlayground
                component={component}
                propsMeta={componentProps || []}
                config={playgroundConfig}
              />
            ) : (
              <Card style={{ padding: 24 }}>
                <Text variant="p">
                  Playground "{playgroundMeta.id}" is declared in metadata but missing a configuration entry.
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
      )
    });
  }

  return (
    <>
      <DocsPageHeader
        action={(
          <Flex direction="row" align="center" gap={8} wrap="wrap" justify="flex-end">
            {/* <TryInExpoGoButton snackUrl={snackUrl} /> */}
            <CopyPageMenu
              pageTitle={newMeta?.title || component}
              targetSelector={`#main-content-${component}`}
              markdown={componentMarkdown || undefined}
            />
          </Flex>
        )}
      >
        {newMeta?.title || component}
      </DocsPageHeader>

      <View style={{ opacity: 0.7 }}>
        {newMeta?.description && (
          <Markdown mb={16}>
            {normalizeDescriptionHeadings(newMeta.description)}
          </Markdown>
        )}
      </View>

      <ComponentResourceLinks component={component} meta={newMeta} snackUrl={snackUrl} />

      {/* Tabs on the left, sticky TOC on the right — the TOC column starts
          below the header instead of alongside it. */}
      <View style={styles.tabsRow}>
        <Tabs
          key={`tabs-${component}`}
          variant="line"
          items={tabItems}
          onTabChange={onTabChange}
          style={styles.tabsColumn}
          // Tab panels carry the page's own gutter, not a second one of their
          // own: demo cards and running text align to the same left edge as the
          // header above the tabs.
          contentStyle={TABS_CONTENT_STYLE}
        />

        {showToc && (
          <View style={styles.sidebarContainer}>
            <View style={styles.stickyToc}>
              <TableOfContents
                key={`toc-${component}`}
                container={`#main-content-${component}`}
                variant="ghost"
                size="sm"
              />
              <SnackQRCode component={component} snackUrl={snackUrl} />
            </View>
          </View>
        )}
      </View>

      {resourceLinks.length > 0 && (
        <Card style={{ padding: 20, marginTop: 24, gap: 12 }}>
          <Text variant="h2" weight="semibold">Further reading</Text>
          <Flex direction="column" gap={10}>
            {resourceLinks.map((resource) => (
              <Link
                key={`${resource.href}-${resource.label ?? resource.href}`}
                href={resource.href}
                target="_blank"
                external
                variant="hover-underline"
                size="sm"
              >
                {resource.label || resource.href}
              </Link>
            ))}
          </Flex>
        </Card>
      )}
    </>
  );
});

export default function ComponentDetailScreen({ component = 'Unknown' }: ComponentDetailScreenProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const [loadedDemoComponents, setLoadedDemoComponents] = useState<Record<string, React.ComponentType>>({});
  // Derived during render, not loaded in an effect. Demo metadata — title,
  // description, and source code — is available synchronously from the generated
  // artifacts, but routing it through an effect meant it was missing during
  // static rendering: every prerendered component page said "No examples
  // available for this component" and shipped none of the example prose or code.
  // Only the interactive preview component is genuinely async (see below).
  const newDemos = useMemo(
    () => (component && hasNewDemosArtifacts() ? attachDemoCode(component, getNewDemos(component)) : []),
    [component]
  );
  // Track the active tab so only the Examples tab shows the TOC.
  const [activeTab, setActiveTab] = useState('demos');
  const handleTabChange = useCallback((tabKey: string) => setActiveTab(tabKey), []);
  // Reset to the first tab whenever the viewed component changes (Tabs is re-keyed
  // too). Adjusting state during render (React's recommended pattern) avoids a
  // setState-in-effect.
  const [prevComponent, setPrevComponent] = useState(component);
  if (component !== prevComponent) {
    setPrevComponent(component);
    setActiveTab('demos');
  }

  // Determine if we should show side-by-side layout (desktop)
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINTS.lg;

  // Helper function to get localized description (stable so ComponentContent memo holds)
  const getLocalizedDescription = useCallback((demo: any) => {
    if (demo.localizedDescriptions && demo.localizedDescriptions[locale]) {
      return demo.localizedDescriptions[locale];
    }
    // Fallback to English if current locale is not available
    if (demo.localizedDescriptions && demo.localizedDescriptions.en) {
      return demo.localizedDescriptions.en;
    }
    // Final fallback to the default description
    return demo.description;
  }, [locale]);

  useBrowserTitle(formatPageTitle(component));

  // Hydrate the runnable demo components. This is the only genuinely async part
  // of a demo, so it is all that remains in an effect — the text and code around
  // it already rendered server-side. Streams in incrementally rather than
  // blocking first paint on the whole set.
  useEffect(() => {
    if (!component) return;
    let cancelled = false;
    newDemos.forEach(async (d: any) => {
      try {
        const mod = await loadDemoComponentNew(component, d.id);
        if (!cancelled && mod) {
          setLoadedDemoComponents(prev => (prev[d.id] ? prev : { ...prev, [d.id]: mod as React.ComponentType }));
        }
      } catch {/* ignore individual demo load errors; already logged in loader */ }
    });
    return () => { cancelled = true; };
  }, [component, newDemos]);

  // Deep links: /components/Button#full-width.
  useFragmentScroll(component, loadedDemoComponents);

  // Only use new demos; legacy unified docs demo list suppressed
  const effectiveDemos = newDemos;
  const hasDemos = effectiveDemos.length > 0;
  // These lookups depend only on `component`; memoize so resize/locale renders don't re-run them.
  const componentProps = useMemo(() => getComponentProps(component), [component]);
  const hasProps = componentProps.length > 0;
  const newMeta = useMemo(
    () => (hasNewDemosArtifacts() ? getNewComponentMeta(component) : null),
    [component]
  );
  const componentMarkdown = useMemo(
    () => (hasNewDemosArtifacts() ? getComponentMarkdown(component) : null),
    [component]
  );
  const playgroundMeta = newMeta?.playground || null;
  const playgroundConfig = useMemo(
    () => (playgroundMeta ? getPlaygroundConfig(playgroundMeta.id) : null),
    [playgroundMeta]
  );

  // No loading gate: everything this screen renders except the interactive demo
  // previews is available synchronously, so the documentation is present in the
  // first (and prerendered) paint instead of behind a spinner.

  if (!newMeta) {
    return (
      <DocsPage>
        <View style={styles.content}>
          <Text variant="h1" style={{ marginBottom: 16 }}>Component not found</Text>
          <Text variant="p" style={{ marginBottom: 24 }}>The component "{component}" could not be found in the documentation.</Text>
          <Button title="Back to Components" onPress={() => router.push('/components')} />
        </View>
      </DocsPage>
    );
  }

  // Shared props for both layout branches (#7 — single source of truth)
  const contentProps: ComponentContentProps = {
    component,
    newMeta,
    effectiveDemos,
    hasDemos,
    hasProps,
    componentProps,
    loadedDemoComponents,
    getLocalizedDescription,
    playgroundMeta,
    playgroundConfig,
    componentMarkdown,
    onTabChange: handleTabChange,
    // The TOC lists the example headings, so it only makes sense on that tab.
    showToc: isDesktop && activeTab === 'demos',
  };

  return (
    <DocsPage id={`main-content-${component}`}>
      <ComponentContent {...contentProps} />
    </DocsPage>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  tabsColumn: {
    flex: 1,
    minWidth: 0, // Prevents flex item from overflowing
  },
  sidebarContainer: {
    width: 280,
    flexShrink: 0,
  },
  stickyToc: {
    position: 'sticky' as any,
    top: 20,
    overflow: 'auto' as any,
    gap: 16,
  },
});
