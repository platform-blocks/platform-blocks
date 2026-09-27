import React from 'react';
import { useRouter } from 'expo-router';
import { Badge, Block, Button, Card, Icon, RollingNumber, Space, Text, Title } from '@platform-blocks/ui';
import { useBrowserTitle, formatPageTitle } from '../hooks/useBrowserTitle';
import { DocsPage } from 'components';
import ChartDemos from '../components/home/ChartDemos';
import ComponentGallery from '../components/home/ComponentGallery';

const CHART_TYPES = [
  ['Bar', 'chart-bar', 'BarChart'], ['Line', 'chart-line', 'LineChart'],
  ['Area', 'chart-area', 'AreaChart'], ['Pie', 'chart-pie', 'PieChart'],
  ['Scatter', 'chart-scatter', 'ScatterChart'], ['Heatmap', 'chart-heatmap', 'HeatmapChart'],
  ['Radar', 'chart-line', 'RadarChart'], ['Funnel', 'funnel', 'FunnelChart'],
  ['Donut', 'chart-donut', 'DonutChart'], ['Gauge', 'speedometer', 'GaugeChart'],
] as const;
const HOOKS = [
  ['useHotkeys', 'Bind keyboard shortcuts to actions', 'keyboard'],
  ['useClipboard', 'Copy text with useful feedback', 'copy'],
  ['useHaptics', 'Add tactile feedback on native devices', 'phone'],
  ['useScrollSpy', 'Keep navigation in sync with the page', 'eye'],
] as const;

function SectionHeading({ eyebrow, title, description, action }: {
  eyebrow: string; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <Block direction="row" align="flex-end" justify="space-between" wrap="wrap" gap="md">
      <Block gap="xs" maxW={700}>
        <Text size="xs" weight="bold" color="primary">{eyebrow}</Text>
        <Title order={2} size="xl">{title}</Title>
        <Text color="secondary">{description}</Text>
      </Block>
      {action}
    </Block>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  useBrowserTitle(formatPageTitle('Home'));
  const chartCols = { base: 1, md: 2, lg: 3 } as const;

  return (
    <DocsPage>
      <Block gap="xl" p="md">
        <Block align="center" gap="lg" py="xl">
          <Badge color="primary" variant="light" startIcon={<Icon name="sparkles" size="xs" />}>
            Open-source UI for React Native
          </Badge>
          <Block fullWidth maxW={850} align="center">
            <Text variant="h1" size={48} weight="bold" align="center">The React Native Component Library.</Text>
          </Block>
          <Block maxW={650}>
            <Text size="lg" color="secondary" align="center">
              A versatile component toolkit for building polished apps on every screen. Works with iOS, Android, and web seamlessly. Try the building blocks below.
            </Text>
          </Block>
          <Block direction="row" align="center" justify="center" wrap="wrap" gap="sm">
            <Button title="Start building" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/getting-started')} />
            <Button title="Browse components" variant="outline" onPress={() => router.push('/components')} />
          </Block>
          <Text size="sm" color="secondary">TypeScript ready · Web and native · Designed to be customized</Text>
        </Block>

        <ComponentGallery />

        <Block direction="row" justify="center" wrap="wrap" gap="md" py="lg">
          {[
            { value: 100, label: 'components' },
            { value: 25, label: 'chart types' },
            { value: 20, label: 'React hooks' },
          ].map(({ value, label }) => (
            <Block key={label} grow basis="30%" minW={180}>
              <Card p="md">
                <Block align="center" gap="xs">
                  <RollingNumber value={value} suffix="+" size={32} weight="bold" animateOnMount />
                  <Text color="secondary">{label}</Text>
                </Block>
              </Card>
            </Block>
          ))}
        </Block>

        <Block gap="lg" py="lg">
          <SectionHeading
            eyebrow="DATA, IN MOTION"
            title="Charts that invite a closer look."
            description="Hover, tap, and explore. These are live charts from the library, not screenshots."
            action={<Button title="Explore charts" variant="subtle" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/charts')} />}
          />
          <ChartDemos cols={chartCols} />
          <Block direction="row" wrap="wrap" gap="sm">
            {CHART_TYPES.map(([name, icon, slug]) => (
              <Button key={slug} title={name} size="sm" variant="outline" startIcon={<Icon name={icon} size="sm" />} onPress={() => router.push(`/components/${slug}`)} />
            ))}
          </Block>
        </Block>

        <Block gap="lg" py="lg">
          <SectionHeading
            eyebrow="THE LITTLE THINGS, HANDLED"
            title="Useful hooks. Fewer loose ends."
            description="Good building blocks go beyond the pixels. Keep everyday interactions simple and consistent."
            action={<Button title="Browse hooks" variant="subtle" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/hooks')} />}
          />
          <Block direction="row" wrap="wrap" gap="md">
            {HOOKS.map(([name, description, icon]) => (
              <Card key={name} p="md" onPress={() => router.push(`/hooks/${name}`)}>
                <Block direction="row" align="center" gap="md">
                  <Icon name={icon} size="sm" color="primary" />
                  <Block gap="xs" grow>
                    <Text weight="semibold">{name}</Text>
                    <Text size="sm" color="secondary">{description}</Text>
                  </Block>
                  <Icon name="arrow-right" size="xs" />
                </Block>
              </Card>
            ))}
          </Block>
        </Block>

        <Card p="lg" variant="filled">
          <Block direction="row" align="center" justify="space-between" wrap="wrap" gap="md">
            <Block gap="xs">
              <Title order={3} size="lg">Your next app starts here.</Title>
              <Text color="secondary">Get up and running with the quickstart guide.</Text>
            </Block>
            <Button title="Read the quickstart" endIcon={<Icon name="arrow-right" />} onPress={() => router.push('/getting-started')} />
          </Block>
        </Card>
        <Space h="xl" />
      </Block>
    </DocsPage>
  );
}
