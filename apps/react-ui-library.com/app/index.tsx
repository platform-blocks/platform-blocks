import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Badge,
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
} from '@platform-blocks/react-ui-library';
import { DocsPage } from '../components/DocsPage';
import ChartDemos from '../components/home/ChartDemos';
import { formatPageTitle, useBrowserTitle } from '../hooks/useBrowserTitle';

const PRODUCT_FEATURES = [
  {
    icon: 'web',
    title: 'One API, every platform',
    description: 'Ship the same components to iOS, Android, and the web without maintaining parallel UI layers.',
  },
  {
    icon: 'keyboard',
    title: 'Accessible by default',
    description: 'Keyboard behavior, focus management, semantics, and screen-reader support are built into the primitives.',
  },
  {
    icon: 'palette',
    title: 'Your design system',
    description: 'Own every color, radius, type scale, shadow, and spacing token through one deeply typed theme.',
  },
  {
    icon: 'sparkles',
    title: 'Motion that feels native',
    description: 'Responsive interactions and polished transitions powered by React Native Reanimated.',
  },
  {
    icon: 'code',
    title: 'TypeScript from end to end',
    description: 'Discoverable props, precise unions, and generated declarations make the editor part of the documentation.',
  },
  {
    icon: 'package',
    title: 'Built to compose',
    description: 'Start with focused primitives, then layer in forms, overlays, data display, media, and navigation.',
  },
] as const;

const COMPONENT_GROUPS = [
  { label: 'Inputs', icon: 'form', detail: 'Text inputs, selects, sliders, dates, and validation' },
  { label: 'Layout', icon: 'grid', detail: 'Responsive grids, stacks, cards, and app shells' },
  { label: 'Feedback', icon: 'message-circle', detail: 'Toasts, dialogs, progress, skeletons, and notices' },
  { label: 'Data display', icon: 'table', detail: 'Tables, trees, timelines, lists, badges, and metrics' },
] as const;

const CHART_TYPES = [
  { name: 'Bar', icon: 'chart-bar', slug: 'BarChart' },
  { name: 'Line', icon: 'chart-line', slug: 'LineChart' },
  { name: 'Area', icon: 'chart-area', slug: 'AreaChart' },
  { name: 'Pie', icon: 'chart-pie', slug: 'PieChart' },
  { name: 'Scatter', icon: 'chart-scatter', slug: 'ScatterChart' },
  { name: 'Heatmap', icon: 'chart-heatmap', slug: 'HeatmapChart' },
] as const;

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <Block style={{ width: '100%', marginBottom: 28 }}>
      <Text size="xs" weight="bold" color="primary" uppercase tracking={1.5}>
        {eyebrow}
      </Text>
      <Space h="xs" />
      <Title order={2} size={34} weight="bold" action={action}>
        {title}
      </Title>
      <Text size="md" color="secondary" style={{ maxWidth: 680 }}>
        {subtitle}
      </Text>
    </Block>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Block>
      <Text size="2xl" weight="bold">{value}</Text>
      <Text size="xs" color="secondary">{label}</Text>
    </Block>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const chartCols = { base: 1, md: 2, lg: 3 } as const;

  useBrowserTitle(formatPageTitle('Home'));

  return (
    <DocsPage contentContainerStyle={{ paddingBottom: 0 }}>
      <Block
        style={{
          width: '100%',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: theme.backgrounds.border,
          backgroundColor: theme.backgrounds.surface,
          padding: 28,
          overflow: 'hidden',
        }}
      >
        <Grid columns={{ base: 1, lg: 12 }} gap="xl" style={{ width: '100%' }}>
          <GridItem span={{ base: 1, lg: 7 }}>
            <Block style={{ maxWidth: 760 }}>
              <Block direction="row" gap="xs" align="center" wrap>
                <Badge variant="subtle" color="primary" size="sm">Open source</Badge>
                <Text size="xs" color="secondary">React Native + Web</Text>
              </Block>
              <Space h="lg" />
              <Title order={1} size={58} weight="bold" style={{ lineHeight: 62 }}>
                The React UI library for every screen.
              </Title>
              <Space h="md" />
              <Text size="xl" color="secondary" style={{ maxWidth: 700, lineHeight: 32 }}>
                Build polished, accessible products with 100+ components, a complete
                theming system, powerful hooks, and production-ready charts.
              </Text>
              <Space h="xl" />
              <Block direction="row" gap="sm" wrap>
                <Button
                  title="Start building"
                  variant="filled"
                  size="lg"
                  endIcon={<Icon name="arrow-right" />}
                  onPress={() => router.push('/getting-started')}
                />
                <Button
                  title="Explore components"
                  variant="outline"
                  size="lg"
                  onPress={() => router.push('/components')}
                />
              </Block>
              <Space h="lg" />
              <Block
                direction="row"
                gap="sm"
                align="center"
                style={{
                  alignSelf: 'flex-start',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: theme.backgrounds.base,
                  borderWidth: 1,
                  borderColor: theme.backgrounds.border,
                }}
              >
                <Text size="sm" color="secondary">$</Text>
                <Text size="sm" family="mono" weight="semibold">npm i @platform-blocks/react-ui-library</Text>
              </Block>
            </Block>
          </GridItem>

          <GridItem span={{ base: 1, lg: 5 }}>
            <Card
              variant="elevated"
              p="lg"
              style={{
                height: '100%',
                minHeight: 360,
                justifyContent: 'space-between',
                backgroundColor: theme.backgrounds.base,
              }}
            >
              <Block>
                <Block direction="row" justify="space-between" align="center">
                  <Block direction="row" gap="xs" align="center">
                    <Block
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: theme.colors.primary[6],
                      }}
                    />
                    <Text size="xs" weight="semibold">READY TO SHIP</Text>
                  </Block>
                  <Icon name="code" color={theme.colors.primary[6]} />
                </Block>
                <Space h="xl" />
                <Text size="xs" color="secondary" uppercase tracking={1.2}>Your product</Text>
                <Title order={3} size={30} weight="bold">One system from idea to interface.</Title>
                <Space h="md" />
                <Text size="sm" color="secondary">
                  Responsive layout, dark mode, interaction states, accessibility,
                  and platform behavior already agree.
                </Text>
              </Block>
              <Block>
                <Grid columns={3} gap="sm" style={{ width: '100%' }}>
                  <GridItem span={1}><Metric value="100+" label="components" /></GridItem>
                  <GridItem span={1}><Metric value="25+" label="charts" /></GridItem>
                  <GridItem span={1}><Metric value="3" label="platforms" /></GridItem>
                </Grid>
                <Space h="lg" />
                <Block direction="row" gap="xs" wrap>
                  {['iOS', 'Android', 'Web', 'TypeScript', 'RTL'].map((label) => (
                    <Badge key={label} variant="outline" color="gray" size="xs">{label}</Badge>
                  ))}
                </Block>
              </Block>
            </Card>
          </GridItem>
        </Grid>
      </Block>

      <Block style={{ width: '100%', paddingVertical: 'var(--pb-section-gap, 48px)' as never }}>
        <SectionHeader
          eyebrow="WHY REACT UI LIBRARY"
          title="The foundation is already finished."
          subtitle="Spend your time on the product that makes you different. The repetitive, cross-platform UI work is handled."
        />
        <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="md" style={{ width: '100%' }}>
          {PRODUCT_FEATURES.map((feature) => (
            <GridItem key={feature.title} span={1}>
              <Card variant="outline" p="lg" style={{ height: '100%' }}>
                <Block
                  align="center"
                  justify="center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: theme.colors.primary[1],
                  }}
                >
                  <Icon name={feature.icon} size="md" color={theme.colors.primary[7]} />
                </Block>
                <Space h="md" />
                <Text size="lg" weight="bold">{feature.title}</Text>
                <Space h="xs" />
                <Text size="sm" color="secondary">{feature.description}</Text>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Block>

      <Block style={{ width: '100%', paddingVertical: 'var(--pb-section-gap, 48px)' as never }}>
        <SectionHeader
          eyebrow="COMPONENT SYSTEM"
          title="Everything your interface needs."
          subtitle="From the first layout primitive to the last production edge case, the pieces share one API and one design language."
          action={<Button title="View all 100+ components" variant="ghost" size="sm" onPress={() => router.push('/components')} />}
        />
        <Grid columns={{ base: 1, md: 2 }} gap="md" style={{ width: '100%' }}>
          {COMPONENT_GROUPS.map((group) => (
            <GridItem key={group.label} span={1}>
              <Pressable onPress={() => router.push('/components')}>
                <Card variant="elevated" p="lg">
                  <Block direction="row" gap="md" align="center">
                    <Icon name={group.icon} size="lg" color={theme.colors.primary[6]} />
                    <Block style={{ flex: 1 }}>
                      <Text size="lg" weight="bold">{group.label}</Text>
                      <Text size="sm" color="secondary">{group.detail}</Text>
                    </Block>
                    <Icon name="external-link" size="sm" color="secondary" />
                  </Block>
                </Card>
              </Pressable>
            </GridItem>
          ))}
        </Grid>
      </Block>

      <Block style={{ width: '100%', paddingVertical: 'var(--pb-section-gap, 48px)' as never }}>
        <SectionHeader
          eyebrow="DATA VISUALIZATION"
          title="Charts that belong in your product."
          subtitle="Interactive, animated, theme-aware visualization for React Native and the web, built on react-native-svg."
          action={<Button title="Explore charts" variant="ghost" size="sm" onPress={() => router.push('/charts')} />}
        />
        <ChartDemos cols={chartCols} />
        <Space h="lg" />
        <Grid columns={{ base: 3, md: 6 }} gap="sm" style={{ width: '100%' }}>
          {CHART_TYPES.map((chart) => (
            <GridItem key={chart.slug} span={1}>
              <Pressable onPress={() => router.push(`/charts/${chart.slug}`)}>
                <Card variant="outline" p="sm" style={{ alignItems: 'center' }}>
                  <Icon name={chart.icon} size="md" color={theme.colors.primary[6]} />
                  <Space h="xs" />
                  <Text size="xs" weight="medium">{chart.name}</Text>
                </Card>
              </Pressable>
            </GridItem>
          ))}
        </Grid>
      </Block>

      <Block
        align="center"
        style={{
          width: '100%',
          marginTop: 24,
          marginBottom: 48,
          padding: 36,
          borderRadius: 24,
          backgroundColor: '#312E81',
        }}
      >
        <Text size="xs" weight="bold" color="white" uppercase tracking={1.5}>START WITH THE SYSTEM</Text>
        <Space h="sm" />
        <Title order={2} size={36} weight="bold" color="white" style={{ textAlign: 'center' }}>
          Build your next interface once.
        </Title>
        <Text size="md" color="white" style={{ maxWidth: 620, textAlign: 'center', opacity: 0.82 }}>
          Use the same components, theme, and behavior from the smallest phone to the widest dashboard.
        </Text>
        <Space h="lg" />
        <Button
          title="Read the getting started guide"
          variant="white"
          size="lg"
          endIcon={<Icon name="arrow-right" />}
          onPress={() => router.push('/getting-started')}
        />
      </Block>
    </DocsPage>
  );
}
