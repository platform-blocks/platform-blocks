# Pareto Chart

Highlight the small number of categories that drive the majority of impact with a bar plus cumulative line visualization.

## Metadata

- Import: `import { ParetoChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, pareto, quality
- Docs: https://plocks.dev/charts/ParetoChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/ParetoChart

## Props

- `data` (required): ParetoChartDatum[] — Raw categories to render inside the Pareto analysis.
- `sortDirection`: 'desc' | 'asc' | 'none' = 'desc' — Sorting direction applied before calculating cumulative percentages.
- `valueSeriesLabel`: string = 'Frequency' — Display label for the bar series.
- `cumulativeSeriesLabel`: string = 'Cumulative %' — Display label for the cumulative line series.
- `barColor`: string — Base color used for the bar series when data points do not provide one.
- `lineColor`: string — Base color used for the cumulative line series.
- `categoryLabelFormatter`: (category: string, index: number) => string — Optional formatter applied to the categorical axis labels.

Plus the `ComboChart` props (`enableCrosshair` `multiTooltip` `liveTooltip` `xDomain` `yDomain` `yDomainRight` `xAxis` `yAxis` `yAxisRight` `grid` `legend`): https://plocks.dev/llms/components/ComboChart.md

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface ParetoChartDatum {
  /** Category or defect name represented by the bar. */
  label: string;
  /** Absolute contribution for the category. */
  value: number;
  /** Optional color override applied to the bar for this category. */
  color?: string;
}
```

## Examples

### Basics

Simple Pareto chart showing how cumulative contribution highlights the dominant defect categories.

```tsx
import { ParetoChart } from '@plocks/charts';

import { DEFECT_BREAKDOWN } from './data';

export function Demo() {
  return (
    <ParetoChart
      title="Monthly defect analysis"
      subtitle="Product QA triage"
      h={420}
      data={DEFECT_BREAKDOWN}
      valueSeriesLabel="Defects"
      cumulativeSeriesLabel="Cumulative impact"
      grid={{ show: true, style: 'dotted' }}
      legend={{ show: true, position: 'bottom' }}
      yAxis={{ title: 'Defects reported' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
```

`data.ts`

```ts
export const DEFECT_BREAKDOWN = [
  { label: 'Authentication', value: 118 },
  { label: 'Checkout', value: 96 },
  { label: 'Notifications', value: 64 },
  { label: 'Analytics', value: 42 },
  { label: 'Billing', value: 31 },
  { label: 'Integrations', value: 27 },
  { label: 'Mobile', value: 19 },
  { label: 'Reporting', value: 17 },
];
```

### Customer Support Hotspots

Highlight how a handful of ticket categories drive the majority of support backlog volume.

```tsx
import { ParetoChart } from '@plocks/charts';

import { SUPPORT_CASES } from './data';

export function Demo() {
  return (
    <ParetoChart
      title="Support backlog concentration"
      subtitle="Top ten case drivers this quarter"
      h={440}
      data={SUPPORT_CASES}
      valueSeriesLabel="Cases"
      cumulativeSeriesLabel="Cumulative ticket share"
      yAxis={{ title: 'Case volume' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
```

`data.ts`

```ts
export const SUPPORT_CASES = [
  { label: 'Login reset', value: 420 },
  { label: 'Billing error', value: 318 },
  { label: 'Delayed shipment', value: 247 },
  { label: 'Missing items', value: 186 },
  { label: 'Promo code', value: 132 },
  { label: 'Damaged product', value: 108 },
  { label: 'Account locked', value: 96 },
  { label: 'Wrong item', value: 74 },
  { label: 'Return label', value: 65 },
  { label: 'Subscription cancel', value: 52 },
];
```

### Incident Root Causes

Root-cause analysis illustrating which failure modes dominate incident volume.

```tsx
import { ParetoChart } from '@plocks/charts';

import { POSTMORTEM_CAUSES } from './data';

export function Demo() {
  return (
    <ParetoChart
      title="Incident root causes"
      subtitle="Rolling twelve months"
      h={420}
      data={POSTMORTEM_CAUSES}
      valueSeriesLabel="Incidents"
      cumulativeSeriesLabel="Cumulative impact"
      sortDirection="none"
      categoryLabelFormatter={(label) => label.replace(' ', '\n')}
      legend={{ show: true, position: 'right' }}
    />
  );
}
```

`data.ts`

```ts
export const POSTMORTEM_CAUSES = [
  { label: 'Configuration drift', value: 38 },
  { label: 'Dependency outage', value: 27 },
  { label: 'Release regression', value: 21 },
  { label: 'Capacity shortfall', value: 17 },
  { label: 'Access change', value: 13 },
  { label: 'Hardware failure', value: 11 },
  { label: 'DDoS attack', value: 9 },
  { label: 'Schema migration', value: 8 },
  { label: 'Data corruption', value: 7 },
  { label: 'Network partition', value: 6 },
  { label: 'Feature flag', value: 5 },
  { label: 'Manual error', value: 4 },
];
```

### Revenue Concentration

Examine how a few strategic accounts make up the bulk of recurring revenue.

```tsx
import { ParetoChart } from '@plocks/charts';

import { ACCOUNT_REVENUE } from './data';

export function Demo() {
  return (
    <ParetoChart
      title="Annual revenue concentration"
      subtitle="Top enterprise accounts"
      h={460}
      data={ACCOUNT_REVENUE}
      valueSeriesLabel="ARR"
      cumulativeSeriesLabel="Cumulative revenue"
      lineColor="#F97316"
      yAxis={{
        title: 'Recurring revenue',
        labelFormatter: (value) => `$${(value / 1_000_000).toFixed(1)}M`,
      }}
      yAxisRight={{
        title: 'Revenue share',
      }}
    />
  );
}
```

`data.ts`

```ts
export const ACCOUNT_REVENUE = [
  { label: 'Acme Corp', value: 2_480_000 },
  { label: 'Brightside', value: 1_940_000 },
  { label: 'Northwind', value: 1_275_000 },
  { label: 'Globex', value: 968_000 },
  { label: 'Initech', value: 744_000 },
  { label: 'Soylent', value: 612_000 },
  { label: 'Umbra', value: 481_000 },
  { label: 'LumenPay', value: 378_000 },
  { label: 'Veridian', value: 326_000 },
  { label: 'Terranova', value: 294_000 },
  { label: 'Zephyr', value: 242_000 },
  { label: 'BlueSky', value: 205_000 },
];
```
