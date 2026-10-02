# Sparkline Chart

Compact inline trend indicator for dense data summaries.

## Metadata

- Import: `import { SparklineChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, sparkline, trend
- Docs: https://plocks.dev/charts/SparklineChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/SparklineChart

## Props

- `id`: string | number — Optional unique series ID
- `name`: string — Optional series name (for tooltip)
- `data` (required): number[] | SparklinePoint[] — Data points (plain y values or explicit {x,y} pairs)
- `color`: string — Line color
- `fill`: boolean = true — Fill area under line
- `fillOpacity`: number = 0.3 — Fill opacity
- `strokeWidth`: number = 2 — Stroke width
- `smooth`: boolean = true — Curve smoothing
- `showPoints`: boolean = false — Show data points
- `pointSize`: number = 3 — Point size (for individual data points)
- `domain`: SparklineDomain — Provide min/max to avoid re-scaling jitter across multiple sparklines
- `highlightLast`: boolean = true — Show last value bubble
- `highlightExtrema`: boolean | SparklineExtremaHighlight — Show min/max markers
- `valueFormatter`: (value: number) => string — Format displayed last value
- `liveTooltip`: boolean = true — Compact tooltip when hovered (web)
- `multiTooltip`: boolean = false — Enable aggregated tooltip when multiple sparklines share context
- `thresholds`: SparklineThreshold[] = [] as SparklineThreshold[] — Horizontal threshold guides
- `bands`: SparklineBand[] = [] as SparklineBand[] — Highlight background regions
- `animation`: SparklineAnimationOptions — Control reveal animation

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface SparklinePoint {
  /** X-axis value for the sparkline point */
  x: number;
  /** Y-axis value for the sparkline point */
  y: number;
}

export interface SparklineDomain {
  /** Explicit x-axis domain override */
  x?: [number, number];
  /** Explicit y-axis domain override */
  y?: [number, number];
}

export interface SparklineExtremaHighlight {
  /** Render marker for minimum value */
  showMin?: boolean;
  /** Render marker for maximum value */
  showMax?: boolean;
  /** Marker fill color (defaults to line color) */
  color?: string;
  /** Marker radius */
  radius?: number;
  /** Outline color */
  strokeColor?: string;
  /** Outline width */
  strokeWidth?: number;
}

export interface SparklineThreshold {
  /** Target value to render as a horizontal guide */
  value: number;
  /** Override line color */
  color?: string;
  /** Line opacity (0-1) */
  opacity?: number;
  /** Render as dashed guide */
  dashed?: boolean;
  /** Optional text label */
  label?: string;
  /** Label placement along the line */
  labelPosition?: 'left' | 'right';
  /** Custom label color */
  labelColor?: string;
  /** Offset label vertically (px) */
  labelOffset?: number;
}

export interface SparklineBand {
  /** Lower bound of the band */
  from: number;
  /** Upper bound of the band */
  to: number;
  /** Fill color (defaults to line color) */
  color?: string;
  /** Fill opacity (0-1) */
  opacity?: number;
}

export interface SparklineAnimationOptions {
  /** Enable/disable line animation */
  enabled?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Delay in ms before animation starts */
  delay?: number;
  /** Easing preset */
  easing?: SparklineAnimationEasing;
}
```

## Examples

### Basics

Compact inline trend indicator for dense data summaries.

```tsx
import { SparklineChart } from '@plocks/charts';

import { DAILY_SIGNUPS } from './data';

export function Demo() {
  return (
    <SparklineChart
      h={72}
      data={DAILY_SIGNUPS}
      fill
      fillOpacity={0.18}
      smooth
      showPoints={false}
      pointSize={4}
      strokeWidth={2.5}
      highlightLast={false}
      valueFormatter={(value) => `${value} signups`}
      domain={{ y: [20, 80] }}
    />
  );
}
```

`data.ts`

```ts
export const DAILY_SIGNUPS = [
  32, 36, 31, 40, 44, 47, 46, 52, 58, 60, 64, 67, 70, 72,
];
```

### Dashboard Daily Active Users

```tsx
import { Block, Card, Flex, Text, Title } from '@plocks/ui';
import { SparklineChart } from '@plocks/charts';

import { SURFACE_SERIES } from './data';

const formatUsers = (value: number) => `${Math.round(value).toLocaleString()} users`;

const getDeltaLabel = (series: number[]) => {
  if (series.length < 2) return 'Stable vs yesterday';
  const latest = series[series.length - 1];
  const prior = series[series.length - 2];
  const delta = latest - prior;
  if (delta === 0) return 'Stable vs yesterday';
  const prefix = delta > 0 ? '+' : '-';
  return `${prefix}${Math.abs(delta).toLocaleString()} vs yesterday`;
};

export function Demo() {
  return (
    <Card padding="lg" radius="lg">
      <Block mb="md">
        <Title order={5} text="Daily Active Users" />
        <Text size="sm" c="muted">Trailing two weeks, by platform</Text>
      </Block>

      <Flex direction="row" wrap="wrap" gap="md">
        {SURFACE_SERIES.map((series) => {
          const latest = series.data[series.data.length - 1];
          return (
            <Block key={series.id} style={{ width: 200 }}>
              <Text size="sm" fw="semibold">{series.title}</Text>
              <Text size="xs" c="muted">
                {latest.toLocaleString()} · {getDeltaLabel(series.data)}
              </Text>
              <SparklineChart
                h={72}
                data={series.data}
                fill
                fillOpacity={0.18}
                smooth
                highlightLast
                valueFormatter={formatUsers}
                domain={{ y: [900, 2300] }}
                thresholds={[{ value: 2100, label: 'Target', dashed: true, color: '#94A3B8', opacity: 0.7, labelPosition: 'right' }]}
              />
            </Block>
          );
        })}
      </Flex>
    </Card>
  );
}
```

`data.ts`

```ts
export const SURFACE_SERIES = [
  {
    id: 'web',
    title: 'Web',
    data: [1820, 1855, 1880, 1915, 1940, 1975, 2010, 2045, 2070, 2095, 2130, 2165, 2195, 2230],
  },
  {
    id: 'ios',
    title: 'iOS',
    data: [940, 955, 968, 984, 1005, 1018, 1042, 1058, 1075, 1098, 1110, 1126, 1148, 1168],
  },
  {
    id: 'android',
    title: 'Android',
    data: [1280, 1295, 1310, 1335, 1342, 1360, 1385, 1410, 1432, 1455, 1470, 1488, 1512, 1536],
  },
];
```

### Release Train Bug Count

```tsx
import { View, Text } from 'react-native';
import { SparklineChart } from '@plocks/charts';

import { BUG_BACKLOG } from './data';

export function Demo() {
  const latest = BUG_BACKLOG[BUG_BACKLOG.length - 1];
  const peak = Math.max(...BUG_BACKLOG);

  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, width: 260 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Bugs per Release Train</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Spike highlighted at {peak} bugs · Latest train: {latest} open
      </Text>

      <SparklineChart
        h={86}
        data={BUG_BACKLOG}
        color="#F03E3E"
        fill
        fillOpacity={0.12}
        smooth
        highlightLast
        highlightExtrema={{ showMax: true, showMin: false, color: '#F03E3E', radius: 4.5, strokeColor: '#FEE2E2', strokeWidth: 1.5 }}
        thresholds={[{ value: 18, label: 'Notice threshold', color: '#F87171', dashed: true, opacity: 0.8, labelPosition: 'left' }]}
        domain={{ y: [8, 26] }}
        valueFormatter={(value) => `${Math.round(value)} bugs`}
      />
    </View>
  );
}
```

`data.ts`

```ts
export const BUG_BACKLOG = [9, 11, 13, 12, 15, 18, 21, 24, 19, 16, 14, 12, 11, 10];
```

### Storefront Weekly Revenue

```tsx
import { View, Text } from 'react-native';
import { SparklineChart } from '@plocks/charts';

import { STOREFRONTS } from './data';

const formatRevenue = (value: number) => `$${value.toFixed(1)}k`;

export function Demo() {
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Weekly Revenue Snapshot</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
        Seven-day trailing revenue (k USD) · Goal line at $110k
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {STOREFRONTS.map((store) => {
          const latest = store.data[store.data.length - 1];
          const minimum = Math.min(...store.data);
          return (
            <View key={store.id} style={{ width: 200, marginRight: 16, marginBottom: 18 }}>
              <Text style={{ fontSize: 13, fontWeight: '600' }}>{store.name}</Text>
              <Text style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
                Latest: {formatRevenue(latest)} · Low: {formatRevenue(minimum)}
              </Text>
              <SparklineChart
                h={76}
                data={store.data}
                color={store.color}
                showPoints
                smooth
                fill
                fillOpacity={0.1}
                domain={{ y: [60, 140] }}
                highlightLast
                highlightExtrema={{ showMin: true, showMax: false, color: store.color, radius: 4, strokeColor: '#FFFFFF', strokeWidth: 1.2 }}
                thresholds={[{ value: 110, label: 'Target', dashed: true, color: '#64748B', opacity: 0.75, labelPosition: 'right' }]}
                valueFormatter={formatRevenue}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
```

`data.ts`

```ts
export const STOREFRONTS = [
  {
    id: 'east-market',
    name: 'East Market',
    color: '#0EA5E9',
    data: [96, 98, 101, 99, 104, 112, 118, 121, 124, 129, 131, 136],
  },
  {
    id: 'central-plaza',
    name: 'Central Plaza',
    color: '#F59E0B',
    data: [88, 90, 93, 95, 96, 98, 101, 103, 105, 108, 112, 115],
  },
  {
    id: 'harbor-side',
    name: 'Harbor Side',
    color: '#10B981',
    data: [72, 78, 81, 86, 90, 95, 97, 100, 103, 106, 111, 114],
  },
];
```

### Support Queue Monitor

```tsx
import { View, Text } from 'react-native';
import { SparklineChart } from '@plocks/charts';

import { QUEUE_DEPTH } from './data';

export function Demo() {
  const current = QUEUE_DEPTH[QUEUE_DEPTH.length - 1];
  const peak = Math.max(...QUEUE_DEPTH);

  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, width: 260 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Support Queue Length</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Current queue: {current} tickets · Peak today: {peak}
      </Text>

      <SparklineChart
        h={82}
        data={QUEUE_DEPTH}
        fill
        fillOpacity={0.14}
        smooth
        highlightLast
        highlightExtrema={{ showMin: false, showMax: true, color: '#6366F1', radius: 4.5, strokeColor: '#EEF2FF', strokeWidth: 1.5 }}
        thresholds={[{ value: 12, label: 'SLA ceiling', dashed: true, color: '#A5B4FC', opacity: 0.85, labelPosition: 'right' }]}
        bands={[{ from: 0, to: 8, color: '#C7D2FE', opacity: 0.18 }]}
        domain={{ y: [4, 18] }}
        animation={{ duration: 400, easing: 'easeInOutCubic' }}
        valueFormatter={(value) => `${Math.round(value)} tickets`}
      />
    </View>
  );
}
```

`data.ts`

```ts
export const QUEUE_DEPTH = [6, 7, 8, 9, 11, 13, 15, 14, 12, 10, 9, 8, 7];
```

### Team Deploy Velocity

```tsx
import { View, Text } from 'react-native';
import { SparklineChart } from '@plocks/charts';

import { TEAMS } from './data';

export function Demo() {
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Deploy Velocity by Team</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
        Rolling 12-day deploy counts · Targets shown as dashed lines
      </Text>

      <View>
        {TEAMS.map((team, index) => (
          <View key={team.id} style={{ marginBottom: index === TEAMS.length - 1 ? 0 : 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{team.name}</Text>
            <SparklineChart
              h={76}
              data={team.data}
              color={team.color}
              smooth
              fill
              fillOpacity={0.08}
              domain={{ y: [0, 9] }}
              highlightLast
              highlightExtrema={{ showMin: true, showMax: true, color: team.color, radius: 4, strokeColor: '#FFFFFF', strokeWidth: 1.2 }}
              thresholds={[{ value: team.target, label: `${team.target} target`, dashed: true, color: '#94A3B8', opacity: 0.85, labelPosition: 'right' }]}
              bands={[{ from: team.target - 0.5, to: team.target + 1, color: '#CBD5F5', opacity: 0.16 }]}
              animation={{ duration: 420, easing: 'easeOutQuad' }}
              valueFormatter={(value) => `${Math.round(value)} deploys`}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
```

`data.ts`

```ts
export const TEAMS = [
  {
    id: 'alpha',
    name: 'Team Alpha',
    color: '#2563EB',
    target: 5,
    data: [3, 4, 5, 6, 5, 5, 6, 7, 6, 6, 7, 7],
  },
  {
    id: 'beta',
    name: 'Team Beta',
    color: '#EC4899',
    target: 4,
    data: [2, 2, 3, 4, 4, 5, 4, 4, 5, 6, 5, 5],
  },
  {
    id: 'gamma',
    name: 'Team Gamma',
    color: '#14B8A6',
    target: 6,
    data: [4, 5, 6, 6, 7, 7, 6, 7, 8, 8, 7, 8],
  },
];
```
