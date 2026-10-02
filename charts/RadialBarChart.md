# Radial Bar Chart

Circular bar segments representing values radially.

## Metadata

- Import: `import { RadialBarChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, radial, bar
- Docs: https://plocks.dev/charts/RadialBarChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/RadialBarChart

## Props

- `data` (required): RadialBarDatum[] — Radial bar data to render
- `radius`: number — Radius of outer ring (auto if not provided)
- `barThickness`: number = 14 — Thickness of each arc
- `gap`: number = 8 — Gap (px) between concentric bars
- `startAngle`: number = -90 — Start angle in degrees (default -90 = top)
- `endAngle`: number = 270 — End angle in degrees (default 270 for full circle)
- `showValueLabels`: boolean = true — Show value labels at the tip of each arc
- `showValueLabelsOnNarrow`: boolean = false — Keep tip labels visible below 400 px even when they crowd the center readout.
- `valueFormatter`: (value: number, datum: RadialBarDatum, index: number) => string — Format value for label
- `centerLabel`: string — Primary text rendered in the empty center (e.g. an aggregate value)
- `centerSubLabel`: string — Secondary text rendered beneath the center label
- `multiTooltip`: boolean = true — Enable aggregated tooltip across arcs
- `liveTooltip`: boolean = true — Keep tooltip following the pointer
- `enableCrosshair`: boolean = false — Highlight the hovered ring (dim the others) on pointer interaction. Default false.
- `legend`: ChartLegend — Legend configuration
- `tooltip`: ChartTooltip<RadialBarDatum> — Tooltip configuration

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface RadialBarDatum {
  /** Unique identifier for the datum */
  id?: string | number;
  /** Numeric value represented by the arc */
  value: number;
  /** Optional per-datum maximum value */
  max?: number;
  /** Label displayed near the arc */
  label?: string;
  /** Color applied to the arc */
  color?: string;
  /** Track color rendered beneath the arc */
  trackColor?: string;
  /** Additional metadata associated with the datum */
  data?: any;
}
```

## Examples

### Basics

Concentric rings compare progress across several metrics, with tip labels and a center average.

```tsx
import { RadialBarChart } from '@plocks/charts';

import { AVG, METRICS } from './data';

export function Demo() {
	return (
		<RadialBarChart
			title="Quarterly KPIs"
			subtitle="Progress toward goals"
			maw={400}
			h={400}
			data={METRICS}
			barThickness={18}
			gap={12}
			showValueLabels
			valueFormatter={(value) => `${value}%`}
			centerLabel={`${AVG}%`}
			centerSubLabel="Avg score"
			multiTooltip
			liveTooltip
			legend={{ show: true, position: 'bottom' }}
		/>
	);
}
```

`data.ts`

```ts
export const METRICS = [
	{ id: 'uptime', label: 'Uptime', value: 99, max: 100, color: '#4C6EF5', trackColor: '#E3E9FF' },
	{ id: 'nps', label: 'NPS', value: 72, max: 100, color: '#20C997', trackColor: '#DEF7EE' },
	{ id: 'retention', label: 'Retention', value: 86, max: 100, color: '#FF922B', trackColor: '#FFE8D7' },
	{ id: 'sla', label: 'SLA', value: 94, max: 100, color: '#845EF7', trackColor: '#EFE6FF' },
];

export const AVG = Math.round(METRICS.reduce((sum, m) => sum + m.value, 0) / METRICS.length);
```

### Goal Progress Ring

A single thick ring with a center readout — ideal for one headline metric.

```tsx
import { RadialBarChart } from '@plocks/charts';

import { GOAL } from './data';

export function Demo() {
	return (
		<RadialBarChart
			title="Fundraising Goal"
			subtitle="$74k raised of $100k"
			maw={300}
			h={300}
			data={GOAL}
			barThickness={24}
			showValueLabels={false}
			centerLabel="74%"
			centerSubLabel="of goal"
			multiTooltip
			liveTooltip
		/>
	);
}
```

`data.ts`

```ts
export const GOAL = [
	{ id: 'raised', label: 'Raised', value: 74, max: 100, color: '#7048E8', trackColor: '#ECE6FF' },
];
```

### Semicircle Gauge

Set startAngle/endAngle to a 180° sweep for a speedometer-style gauge that fills the space.

```tsx
import { RadialBarChart } from '@plocks/charts';

import { SCORE } from './data';

export function Demo() {
	return (
		<RadialBarChart
			title="Customer Satisfaction"
			subtitle="Rolling 30-day CSAT"
			maw={340}
			h={240}
			startAngle={-90}
			endAngle={90}
			data={SCORE}
			barThickness={24}
			showValueLabels={false}
			centerLabel="82"
			centerSubLabel="out of 100"
			multiTooltip
			liveTooltip
		/>
	);
}
```

`data.ts`

```ts
export const SCORE = [
	{ id: 'csat', label: 'CSAT', value: 82, max: 100, color: '#20C997', trackColor: '#DEF7EE' },
];
```
