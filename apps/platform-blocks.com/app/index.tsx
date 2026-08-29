import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Block,
  Button,
  Card,
  Grid,
  GridItem,
  Icon,
  Space,
  Text,
  Title,
  useTheme,
} from '@platform-blocks/ui';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { DocsPage } from 'components';
import { DocsPageHeader } from '../components/DocsPageHeader';
import ChartDemos from '../components/home/ChartDemos';

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const CHART_TYPES: { name: string; icon: string; slug: string }[] = [
  { name: 'Bar', icon: 'chart-bar', slug: 'BarChart' },
  { name: 'Line', icon: 'chart-line', slug: 'LineChart' },
  { name: 'Area', icon: 'chart-area', slug: 'AreaChart' },
  { name: 'Pie', icon: 'chart-pie', slug: 'PieChart' },
  { name: 'Scatter', icon: 'chart-scatter', slug: 'ScatterChart' },
  { name: 'Heatmap', icon: 'chart-heatmap', slug: 'HeatmapChart' },
  { name: 'Radar', icon: 'chart-line', slug: 'RadarChart' },
  { name: 'Candlestick', icon: 'chart-line', slug: 'CandlestickChart' },
  { name: 'Funnel', icon: 'funnel', slug: 'FunnelChart' },
  { name: 'Sankey', icon: 'chart-line', slug: 'SankeyChart' },
  { name: 'Donut', icon: 'chart-donut', slug: 'DonutChart' },
  { name: 'Gauge', icon: 'speedometer', slug: 'GaugeChart' },
];

const HOOKS: { icon: string; name: string; description: string; route: string }[] = [
  { icon: 'keyboard', name: 'useHotkeys', description: 'Bind keyboard shortcuts to actions', route: '/hooks/useHotkeys' },
  { icon: 'copy', name: 'useClipboard', description: 'Copy text to clipboard with feedback', route: '/hooks/useClipboard' },
  { icon: 'phone', name: 'useHaptics', description: 'Trigger haptic feedback on native devices', route: '/hooks/useHaptics' },
  { icon: 'eye', name: 'useScrollSpy', description: 'Track visible sections for table-of-contents highlighting', route: '/hooks/useScrollSpy' },
  { icon: 'text', name: 'useMaskedInput', description: 'Apply input masks for phone, currency, and other formats', route: '/hooks/useMaskedInput' },
  { icon: 'info', name: 'useDeviceInfo', description: 'Access platform, screen, and device capabilities', route: '/hooks/useDeviceInfo' },
];

const CHART_HOOKS: { icon: string; name: string; description: string }[] = [
  { icon: 'search', name: 'usePanZoom', description: 'Pan and zoom gesture handling for chart interaction' },
  { icon: 'refresh', name: 'useStreamingData', description: 'Handle real-time data feeds with automatic chart updates' },
  { icon: 'sparkles', name: 'useChartAnimation', description: 'Control animation timing and transitions' },
  { icon: 'target', name: 'useChartPointer', description: 'Normalized pointer + hit-testing for chart interaction' },
];

/* ------------------------------------------------------------------ */
/*  Section heading helper                                            */
/* ------------------------------------------------------------------ */

function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <Block style={{ width: '100%', marginBottom: 24 }}>
      <Title order={2} size={28} weight="bold" action={action}>{title}</Title>
      <Text size="md" color="secondary" style={{ maxWidth: 640 }}>{subtitle}</Text>
    </Block>
  );
}

/* ------------------------------------------------------------------ */
/*  Home screen                                                       */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Column counts go to `Grid` as responsive objects, not as numbers resolved
  // here: the breakpoint this component sees starts at a guess and settles
  // after mount, so a number computed from it paints one layout and then
  // reflows into another. Handed the object, Grid resolves it in CSS, at the
  // right width, on the first paint. (Grid's own scale: sm 480, md 640, lg 960.)
  const chartCols = { base: 1, md: 2, lg: 3 } as const;
  const chartTypeCols = { base: 3, md: 4, lg: 6 } as const;

  useBrowserTitle(formatPageTitle('Home'));

  return (
    <DocsPage>

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Hero prose stays narrow for readability, but the block itself starts at
          the page column's edge so the h1 lines up with every other page's. */}
      {/* No top padding: the hero h1 starts where every other page's h1 does. */}
      {/* Vertical rhythm is a viewport question too, and answering it from the
          breakpoint means painting one spacing and reflowing into another once
          it settles. The variables are defined in app/+html.tsx. */}
      <Block style={{ width: '100%', paddingBottom: 'var(--pb-section-gap-tight, 24px)' as any }}>
        <DocsPageHeader
          subtitle="Build cross-platform apps faster than ever — Platform Blocks includes more than 100 customizable components, 25+ chart types, and a hooks library to cover you in any situation"
          subtitleProps={{ style: { maxWidth: 800 } }}
        >Platform Blocks</DocsPageHeader>
        <Space h="xl" />
        <Block direction="row" gap="md" wrap>
          <Button 
          title="Get Started" 
          variant="filled" 
          onPress={() => router.push('/getting-started')} 
          />
          <Button
            title="Browse components"
            variant="subtle"
            endIcon={<Icon name="arrow-right" stroke={6} />}
            onPress={() => router.push('/components')}
          />
        </Block>
      </Block>

      {/* ━━ DATA VISUALIZATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Block style={{ width: '100%', paddingVertical: 'var(--pb-section-gap, 32px)' as any }}>
        <SectionHeader
          title="Data visualization"
          subtitle="25+ chart types with smooth animations, interactive tooltips, pan & zoom, and real-time streaming support — all rendered natively with react-native-svg."
          action={<Button title="Browse all charts" variant="ghost" size="sm" onPress={() => router.push('/charts')} />}
        />

        {/* Live chart demos. Imported statically: the web export is one bundle
            for every route, and five other modules — the chart routes, the
            showcase and playground registries, the dashboard example — already
            pull the charts barrel into it, so splitting these three demos off
            saved nothing and only delayed them behind a second round trip. */}
        <ChartDemos cols={chartCols} />

        {/* Chart type grid */}
        <Grid columns={chartTypeCols} gap="sm" style={{ width: '100%' }}>
          {CHART_TYPES.map((chart) => (
            <GridItem key={chart.slug} span={1}>
              <Pressable onPress={() => router.push(`/components/${chart.slug}`)}>
                <Card variant="elevated" p="sm" style={{ alignItems: 'center' }}>
                  <Icon name={chart.icon} size="md" color={theme.colors.primary[6]} />
                  <Space h="xs" />
                  <Text size="xs" weight="medium">{chart.name}</Text>
                </Card>
              </Pressable>
            </GridItem>
          ))}
        </Grid>
      </Block>

      {/* ━━ HOOKS LIBRARY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Block style={{ width: '100%', paddingVertical: 'var(--pb-section-gap, 32px)' as any }}>
        <SectionHeader
          title="Hooks library"
          subtitle="Reusable React hooks for common and complex tasks — keyboard shortcuts, haptics, clipboard, scroll tracking, and more."
          action={<Button title="Browse all hooks" variant="ghost" size="sm" onPress={() => router.push('/hooks')} />}
        />

        <Grid columns={{ base: 1, sm: 2, xl: 3 }} gap="md" style={{ width: '100%' }}>
          {HOOKS.map((hook) => (
            <GridItem key={hook.name} span={1}>
              <Pressable onPress={() => router.push(hook.route)}>
                <Card variant="elevated" p="lg" style={{ height: '100%' }}>
                  <Block direction="row" gap="sm" align="center">
                    <Icon name={hook.icon} size="md" color={theme.colors.primary[6]} />
                    <Text size="md" weight="semibold" color={theme.colors.primary[6]}>{hook.name}</Text>
                  </Block>
                  <Space h="xs" />
                  <Text size="sm" color="secondary">{hook.description}</Text>
                </Card>
              </Pressable>
            </GridItem>
          ))}
        </Grid>

        <Space h="lg" />
        <Text size="sm" weight="semibold" style={{ marginBottom: 12 }}>Chart hooks</Text>
        <Grid columns={{ base: 1, sm: 2 }} gap="md" style={{ width: '100%' }}>
          {CHART_HOOKS.map((hook) => (
            <GridItem key={hook.name} span={1}>
              <Card variant="elevated" p="md">
                <Block direction="row" gap="sm" align="center">
                  <Icon name={hook.icon} size="sm" color={theme.colors.primary[6]} />
                  <Text size="sm" weight="semibold" color={theme.colors.primary[6]}>{hook.name}</Text>
                </Block>
                <Space h="xs" />
                <Text size="xs" color="secondary">{hook.description}</Text>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Block>

      <Space h="xl" />
    </DocsPage>
  );
}
