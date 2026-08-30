# Sparkline Chart

Compact inline trend indicator for dense data summaries.

## Metadata

- Canonical name: `SparklineChart`
- Package: `@platform-blocks/charts`
- Import: `import { SparklineChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, sparkline, trend
- Docs: https://react-ui-library.com/components/SparklineChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/SparklineChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | string \| number | No |  | Optional unique series ID |
| `name` | string | No |  | Optional series name (for tooltip) |
| `data` | number[] \| SparklinePoint[] | Yes |  | Data points (plain y values or explicit {x,y} pairs) |
| `color` | string | No |  | Line color |
| `fill` | boolean | No | true | Fill area under line |
| `fillOpacity` | number | No | 0.3 | Fill opacity |
| `strokeWidth` | number | No | 2 | Stroke width |
| `smooth` | boolean | No | true | Curve smoothing |
| `showPoints` | boolean | No | false | Show data points |
| `pointSize` | number | No | 3 | Point size (for individual data points) |
| `domain` | SparklineDomain | No |  | Provide min/max to avoid re-scaling jitter across multiple sparklines |
| `highlightLast` | boolean | No | true | Show last value bubble |
| `highlightExtrema` | boolean \| SparklineExtremaHighlight | No |  | Show min/max markers |
| `valueFormatter` | (value: number) => string | No |  | Format displayed last value |
| `liveTooltip` | boolean | No | true | Compact tooltip when hovered (web) |
| `multiTooltip` | boolean | No | false | Enable aggregated tooltip when multiple sparklines share context |
| `thresholds` | SparklineThreshold[] | No | [] as SparklineThreshold[] | Horizontal threshold guides |
| `bands` | SparklineBand[] | No | [] as SparklineBand[] | Highlight background regions |
| `animation` | SparklineAnimationOptions | No |  | Control reveal animation |
| `width` | number | No | 120 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 48 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
| `aspectRatio` | number | No |  | Height as a fraction of the resolved width (`width / height`), used when `height` is omitted. `2` keeps the chart twice as wide as it is tall at every container size. |
| `maxWidth` | number | No |  | Upper bound on the resolved width. Useful for radial charts in wide columns. |
| `minWidth` | number | No |  | Lower bound on the resolved width. |
| `maxHeight` | number | No |  | Upper bound on a height derived from `aspectRatio`. |
| `minHeight` | number | No |  | Lower bound on a height derived from `aspectRatio`. |
| `testID` | string | No |  | Chart test ID for testing |
| `style` | any | No |  | Additional styles |
| `accessibilityLabel` | string | No |  | Accessibility label surfaced to assistive tech |
| `accessibilityHint` | string | No |  | Accessibility hint describing chart interaction |
| `accessibilityRole` | string | No |  | Accessibility role override |
| `accessible` | boolean | No |  | Whether the chart container is accessible |
| `importantForAccessibility` | 'auto' \| 'yes' \| 'no' \| 'no-hide-descendants' | No |  | Platform specific accessibility importance |
| `animationDuration` | number | No |  | Animation duration in ms |
| `animationEasing` | string | No |  | Animation easing function |
| `disabled` | boolean | No | false | Whether chart is disabled |
| `title` | string | No |  | Chart title |
| `subtitle` | string | No |  | Chart subtitle |
| `useOwnInteractionProvider` | boolean | No |  | If false, chart expects a parent interaction provider (shared context). |
| `suppressPopover` | boolean | No |  | Force suppress or show internal popover (auto suppressed when useOwnInteractionProvider=false if undefined). |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basic
ID: `SparklineChart.basic` • Category: charts

```tsx
return (
    <SparklineChart
      height={72}
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

### Dashboard Daily Active Users
ID: `SparklineChart.dashboard-daily-active-users` • Category: charts

```tsx
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
  return (
    <Card padding="lg" radius="lg">
      <Block mb="md">
        <Title order={5} text="Daily Active Users" />
        <Text size="sm" c="dimmed">Trailing two weeks, by platform</Text>
      </Block>
      <Flex direction="row" wrap="wrap" gap="md">
        {SURFACE_SERIES.map((series) => {
          const latest = series.data[series.data.length - 1];
          return (
            <Block key={series.id} style={{ width: 200 }}>
              <Text size="sm" weight="semibold">{series.title}</Text>
              <Text size="xs" c="dimmed">
                {latest.toLocaleString()} · {getDeltaLabel(series.data)}
              </Text>
              <SparklineChart
                height={72}
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

### Release Train Bug Count
ID: `SparklineChart.release-train-bug-count` • Category: charts

```tsx
const latest = BUG_BACKLOG[BUG_BACKLOG.length - 1];
  const peak = Math.max(...BUG_BACKLOG);
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, width: 260 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Bugs per Release Train</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Spike highlighted at {peak} bugs · Latest train: {latest} open
      </Text>
      <SparklineChart
        height={86}
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

### Storefront Weekly Revenue
ID: `SparklineChart.storefront-weekly-revenue` • Category: charts

```tsx
const formatRevenue = (value: number) => `$${value.toFixed(1)}k`;
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
                height={76}
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

### Support Queue Monitor
ID: `SparklineChart.support-queue-monitor` • Category: charts

```tsx
const current = QUEUE_DEPTH[QUEUE_DEPTH.length - 1];
  const peak = Math.max(...QUEUE_DEPTH);
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, width: 260 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Support Queue Length</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        Current queue: {current} tickets · Peak today: {peak}
      </Text>
      <SparklineChart
        height={82}
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

### Team Deploy Velocity
ID: `SparklineChart.team-deploy-velocity` • Category: charts

```tsx
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
              height={76}
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
