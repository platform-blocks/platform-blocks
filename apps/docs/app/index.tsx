import React from 'react';
import { useRouter } from 'expo-router';
import { Badge, Block, Button, Card, Flex, Grid, GridItem, Icon, RollingNumber, Text, Title } from '@plocks/ui';
import { useBrowserTitle } from '../hooks/useBrowserTitle';
import { HOME_TITLE } from '../config/routeSeo';
import { DocsPage } from 'components';
import ChartDemos from '../components/home/ChartDemos';
import ComponentGallery from '../components/home/ComponentGallery';
import { HeroMark } from '../components/home/HeroMark';
import { BrandIcon } from "../../../packages/brands/src/components/BrandIcon";
import { componentRoute } from '../utils/componentRoute';
import { CATALOG_COUNTS } from '../config/catalogCounts';

const CHART_TYPES = [
  ['Bar', 'chart-bar', 'BarChart'], ['Line', 'chart-line', 'LineChart'],
  ['Area', 'chart-area', 'AreaChart'], ['Pie', 'chart-pie', 'PieChart'],
  ['Scatter', 'chart-scatter', 'ScatterChart'], ['Heatmap', 'chart-heatmap', 'HeatmapChart'],
  ['Radar', 'chart-line', 'RadarChart'], ['Funnel', 'funnel', 'FunnelChart'],
  ['Donut', 'chart-donut', 'DonutChart'],
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
      <Block gap="xs" maw={700}>
        <Text size="xs" fw="bold" c="primary">{eyebrow}</Text>
        <Title order={2} size="xl">{title}</Title>
        <Text c="secondary">{description}</Text>
      </Block>
      {action}
    </Block>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  useBrowserTitle(HOME_TITLE);
  const chartCols = { base: 1, md: 2, lg: 3 } as const;

  return (
    <DocsPage>
      <Block gap="xl">
        <Block align="center" gap="md" py="md">
          <HeroMark size={168} />
          {/* <Badge color="gray" size="xl" variant="subtle" startSection={<BrandIcon brand="react"  />}>
            Built with React Native
          </Badge>z */}
          <Block fullWidth maw={850} align="center">
            <Text variant="h1" size={48} fw="bold" ta="center" tx="Components that snap together."/>
          </Block>
          <Block maw={650}>

          <Flex direction="row" wrap="wrap" gap="sm">
          <Badge color="gray" size="xl" variant="subtle" startSection={<BrandIcon brand="react"  />}>
            React Native
          </Badge>
          <Badge color="gray" size="xl" variant="subtle" startSection={<BrandIcon brand="expo"  />}>
            Expo
          </Badge>
          </Flex>

          </Block>
          <Block direction="row" align="center" justify="center" wrap="wrap" gap="sm">
            <Button title="Start building" color="secondary" variant="gradient" endSection={<Icon name="arrow-right" />} onPress={() => router.push('/getting-started')} />
            <Button title={`${CATALOG_COUNTS.components} components`} variant="gradient" onPress={() => router.push('/components')} />
          </Block>
          <Text size="sm" c="secondary">TypeScript ready · Web and native · Designed to be customized</Text>
        </Block>

        <ComponentGallery />

        <Block direction="row" justify="center" wrap="wrap" gap="md">
          {[
            { value: CATALOG_COUNTS.components, label: 'components' },
            { value: CATALOG_COUNTS.charts, label: 'chart types' },
            { value: CATALOG_COUNTS.hooks, label: 'React hooks' },
          ].map(({ value, label }) => (
            <Block key={label} grow basis="30%" miw={180}>
              <Card p="md">
                <Block align="center" gap="xs">
                  <RollingNumber value={value} size={32} fw="bold" animateOnMount />
                  <Text c="secondary">{label}</Text>
                </Block>
              </Card>
            </Block>
          ))}
        </Block>

        <Block gap="lg">
          <SectionHeading
            eyebrow="DATA, IN MOTION"
            title="Charts that invite a closer look."
            description="Hover, tap, and explore. These are live charts from the library, not screenshots."
            action={<Button title="Explore charts" variant="subtle" endSection={<Icon name="arrow-right" />} onPress={() => router.push('/charts')} />}
          />
          <ChartDemos cols={chartCols} />
          <Block direction="row" wrap="wrap" gap="sm">
            {CHART_TYPES.map(([name, icon, slug]) => (
              <Button key={slug} title={name} size="sm" variant="outline" startSection={<Icon name={icon} size="sm" />} onPress={() => router.push(componentRoute(slug))} />
            ))}
          </Block>
        </Block>

        <Block gap="lg">
          <SectionHeading
            eyebrow="THE LITTLE THINGS, HANDLED"
            title="Useful hooks. Fewer loose ends."
            description="Good building blocks go beyond the pixels. Keep everyday interactions simple and consistent."
            action={<Button title="Browse hooks" variant="subtle" endSection={<Icon name="arrow-right" />} onPress={() => router.push('/hooks')} />}
          />
          <Grid columns={{ base: 1, md: 2, xl: 4 }} gap="md" fullWidth>
            {HOOKS.map(([name, description, icon]) => (
              <GridItem key={name} span={1}>
                <Card p="md" style={{ flex: 1 }} onPress={() => router.push(`/hooks/${name}`)}>
                  <Block direction="row" align="center" gap="md">
                    <Icon name={icon} size="sm" color="primary" />
                    <Block gap="xs" grow>
                      <Text fw="semibold">{name}</Text>
                      <Text size="sm" c="secondary">{description}</Text>
                    </Block>
                    <Icon name="arrow-right" size="xs" />
                  </Block>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Block>

        <Card p="lg" variant="filled">
          <Block direction="row" align="center" justify="space-between" wrap="wrap" gap="md">
            <Block gap="xs">
              <Title order={3} size="lg">Your next app starts here.</Title>
              <Text c="secondary">Get up and running with the quickstart guide.</Text>
            </Block>
            <Button title="Read the quickstart" endSection={<Icon name="arrow-right" />} onPress={() => router.push('/getting-started')} />
          </Block>
        </Card>
      </Block>
    </DocsPage>
  );
}
