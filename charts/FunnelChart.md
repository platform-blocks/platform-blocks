# Funnel Chart

Shows progressive reduction of data through stages (conversion pipeline).

## Metadata

- Import: `import { FunnelChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, funnel, conversion
- Docs: https://plocks.dev/charts/FunnelChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/FunnelChart

## Props

- `series` (required): FunnelChartSeries | FunnelChartSeries[] — Funnel data series to render
- `layout`: FunnelLayoutConfig — Layout customization options
- `valueFormatter`: FunnelValueFormatter — Formatter for step values
- `tooltip`: ChartTooltip<FunnelStep> — Tooltip configuration
- `legend`: ChartLegend — Legend configuration
- `enableCrosshair`: boolean = true — Enable crosshair indicator
- `multiTooltip`: boolean = true — Enable aggregated tooltip for multiple series
- `liveTooltip`: boolean = false — Keep tooltip following the pointer
- `accessibilityTable`: FunnelAccessibilityTableOptions — Render hidden accessibility table
- `onDataTable`: (payloads: FunnelDataTablePayload[]) => void — Callback invoked with data table payload

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface FunnelChartSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Ordered steps within the funnel */
  steps: FunnelStep[];
  /** Base color applied to the steps */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
}

export interface FunnelLayoutConfig {
  /** Shape style used to render steps */
  shape?: 'trapezoid' | 'bar';
  /** Gap between consecutive steps */
  gap?: number;
  /** Minimum pixel height for each segment */
  minSegmentHeight?: number;
  /** Horizontal alignment of the funnel */
  align?: 'center' | 'left' | 'right';
  /** Show conversion percentage between steps */
  showConversion?: boolean;
  /** How to render multiple series */
  seriesMode?: 'single' | 'grouped' | 'stacked';
  /** Pixel breakpoint used to switch to left-aligned layout */
  responsiveBreakpoint?: number;
  /** Extra spacing between grouped segments */
  groupGap?: number;
  /** Optional maximum label width before truncation */
  labelMaxWidth?: number;
  /** Connector configuration */
  connectors?: FunnelConnectorConfig;
}

export type FunnelValueFormatter = (
  value: number,
  index: number,
  context?: FunnelValueFormatterContext
) => string | string[];

export interface FunnelStep {
  /** Step label displayed in the funnel */
  label: string;
  /** Absolute value for the step */
  value: number;
  /** Override color used for the step */
  color?: string;
  /** Additional metadata associated with the step */
  meta?: any;
  /** Optional override for where the label should render */
  labelPosition?: 'inside' | 'outside-left' | 'outside-right';
  /** Human readable label for the trend delta */
  trendLabel?: string;
  /** Numeric delta used to drive up/down styling */
  trendDelta?: number;
}

export interface FunnelAccessibilityTableOptions {
  /** Display the hidden accessible table representation */
  show?: boolean;
  /** Optional aria-label or summary text */
  summary?: string;
  /** Custom id for the hidden table element */
  id?: string;
}

export interface FunnelDataTablePayload {
  /** Series identifier (for grouped funnels) */
  seriesId: string | number | undefined;
  /** Series display name */
  seriesName?: string;
  /** Flattened rows for consumers */
  rows: FunnelDataTableRow[];
}

export interface FunnelConnectorConfig {
  /** Render connectors between stages */
  show?: boolean;
  /** Stroke color for the connecting lines */
  stroke?: string;
  /** Stroke width for connector lines */
  strokeWidth?: number;
  /** Optional radius for rounded connector corners */
  radius?: number;
  /** Format the label displayed around the connector */
  labelFormatter?: FunnelConversionLabelFormatter;
  /** Offset applied to the connector label */
  labelOffset?: number;
}

export interface FunnelValueFormatterContext {
  /** Step index */
  index: number;
  /** Step currently being rendered */
  step: FunnelStep;
  /** All steps in the funnel */
  steps: FunnelStep[];
  /** Previous step value if available */
  previousValue?: number;
  /** First step value for retention calculations */
  firstValue: number;
  /** Share of the first step still present (0-1) */
  conversion: number;
  /** Share lost vs. the previous step (0-1) */
  dropRate: number;
  /** Absolute drop amount vs. the previous step */
  dropValue: number;
}
```

## Examples

### Basics

Shows progressive reduction of data through stages (conversion pipeline).

```tsx
import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { SALES_FUNNEL } from './data';

export function Demo() {
	return (
		<FunnelChart
			title="Product acquisition funnel"
			maw={420}
			h={420}
			series={SALES_FUNNEL}
			layout={{
				shape: 'trapezoid',
				gap: 8,
				showConversion: false,
				align: 'center',
				connectors: { show: false },
			}}
			valueFormatter={(value) => formatCompactNumber(value)}
			legend={{ show: false }}
			tooltip={{
				show: true,
				formatter: (step) => `${step.label}: ${step.value.toLocaleString()}`,
			}}
		/>
	);
}
```

`data.ts`

```ts
export const SALES_FUNNEL = {
	id: 'pipeline',
	name: 'Q2 pipeline',
	steps: [
		{ label: 'Website visits', value: 32_500 },
		{ label: 'Sign-ups', value: 9_600 },
		{ label: 'Qualified leads', value: 4_350 },
		{ label: 'Trials started', value: 2_150 },
		{ label: 'Customers', value: 1_120 },
	],
};
```

### Data Pipeline Quality

```tsx
import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { PIPELINE_QUALITY, PipelineMeta } from './data';

export function Demo() {
  return (
    <FunnelChart
      title="Data pipeline quality checks"
      subtitle="From ingestion to certified datasets"
      maw={520}
      h={440}
      series={PIPELINE_QUALITY}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const idx = PIPELINE_QUALITY.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = idx > 0 ? PIPELINE_QUALITY.steps[idx - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as PipelineMeta | undefined;
          return [
            step.label,
            `${step.value.toLocaleString()} rows`,
            previous ? `Filtered: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Ingestion baseline',
            meta?.note,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export type PipelineMeta = {
  note?: string;
};

export const PIPELINE_QUALITY = {
  id: 'data-quality-pipeline',
  name: 'Data quality checkpoints',
  steps: [
    { label: 'Ingested', value: 12_400_000 },
    { label: 'Validated', value: 11_760_000, meta: { note: 'Dropped malformed partner feeds and null timestamps' } as PipelineMeta },
    { label: 'Deduplicated', value: 11_180_000, meta: { note: 'UserId + sessionId key resolves campaign duplicates' } as PipelineMeta },
    { label: 'QA passed', value: 10_260_000, meta: { note: 'Primary blockers: stale reference data & threshold breaches' } as PipelineMeta },
    { label: 'Certified', value: 9_940_000, meta: { note: 'Ready for downstream activation' } as PipelineMeta },
  ],
};
```

### Ecommerce Checkout Payments

```tsx
import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { CHECKOUT_FUNNEL, CheckoutMeta } from './data';

const formatPaymentSplit = (split: CheckoutMeta['paymentSplit']) => {
  if (!split) return undefined;
  return `Payment mix: ${Math.round(split.stripe * 100)}% Stripe • ${Math.round(split.paypal * 100)}% PayPal • ${Math.round(split.bnpl * 100)}% BNPL`;
};

export function Demo() {
  return (
    <FunnelChart
      title="Ecommerce checkout conversion"
      subtitle="Drop-off by stage"
      maw={520}
      h={440}
      series={CHECKOUT_FUNNEL}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const idx = CHECKOUT_FUNNEL.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = idx > 0 ? CHECKOUT_FUNNEL.steps[idx - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as CheckoutMeta | undefined;
          const paymentSplit = formatPaymentSplit(meta?.paymentSplit);
          return [
            step.label,
            `${step.value.toLocaleString()} sessions`,
            previous ? `Drop: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Entry point',
            meta?.insight,
            paymentSplit,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export type CheckoutMeta = {
  insight?: string;
  paymentSplit?: {
    stripe: number;
    paypal: number;
    bnpl: number;
  };
};

export const CHECKOUT_FUNNEL = {
  id: 'checkout-flow',
  name: 'Checkout completion',
  steps: [
    { label: 'Product views', value: 158_000 },
    { label: 'Carts', value: 89_400, meta: { insight: 'Shipping cost surprises prompt abandon' } as CheckoutMeta },
    { label: 'Shipping', value: 74_200, meta: { insight: 'Address autocomplete boosted completion +12%' } as CheckoutMeta },
    { label: 'Payment', value: 51_200, meta: { insight: 'Card validations reject 28% due to CVV retries' } as CheckoutMeta },
    { label: 'Orders', value: 38_600, meta: { paymentSplit: { stripe: 0.52, paypal: 0.31, bnpl: 0.17 } } as CheckoutMeta },
  ],
};
```

### Hiring Funnel Role Family

```tsx
import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { HIRING_SERIES, HiringMeta, STEP_LOOKUP } from './data';

const findSeriesContext = (step: unknown) => STEP_LOOKUP.get(step as any) ?? null;

export function Demo() {
  return (
    <FunnelChart
      title="Hiring funnel — Staff engineer"
      subtitle="External candidates vs. internal transfers"
      maw={620}
      h={480}
      series={HIRING_SERIES}
      layout={{
        shape: 'bar',
        gap: 10,
        align: 'center',
        showConversion: false,
        seriesMode: 'grouped',
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      tooltip={{
        show: true,
        formatter: (step) => {
          const lookup = findSeriesContext(step as any) ?? undefined;
          if (!lookup) {
            return `${step.label}: ${step.value.toLocaleString()} candidates`;
          }
          const series = lookup.series;
          const stepIndex = lookup.stepIndex;
          const previous = stepIndex > 0 ? series.steps[stepIndex - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as HiringMeta | undefined;
          return [
            `${step.label} • ${series.name}`,
            `${step.value.toLocaleString()} candidates`,
            previous ? `Drop: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Pipeline intake',
            meta?.medianDays != null ? `Median time in stage: ${meta.medianDays} days` : undefined,
            meta?.topDeclineReason ? `Top decline reason: ${meta.topDeclineReason}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export type HiringMeta = {
  medianDays?: number;
  topDeclineReason?: string;
};

export const EXTERNAL_CANDIDATES = [
  { label: 'Applied', value: 780, meta: { medianDays: 0 } as HiringMeta },
  { label: 'Screen', value: 420, meta: { medianDays: 3, topDeclineReason: 'Insufficient architecture depth' } as HiringMeta },
  { label: 'HM interview', value: 210, meta: { medianDays: 6, topDeclineReason: 'Product strategy alignment' } as HiringMeta },
  { label: 'Panel', value: 120, meta: { medianDays: 12, topDeclineReason: 'Leadership signal gaps' } as HiringMeta },
  { label: 'Offered', value: 48, meta: { medianDays: 18, topDeclineReason: 'Compensation delta' } as HiringMeta },
  { label: 'Accepted', value: 22, meta: { medianDays: 24 } as HiringMeta },
];

export const INTERNAL_TRANSFERS = [
  { label: 'Applied', value: 220, meta: { medianDays: 0 } as HiringMeta },
  { label: 'Screen', value: 188, meta: { medianDays: 2, topDeclineReason: 'Role scope mismatch' } as HiringMeta },
  { label: 'HM interview', value: 150, meta: { medianDays: 5, topDeclineReason: 'Org fit feedback' } as HiringMeta },
  { label: 'Panel', value: 110, meta: { medianDays: 9, topDeclineReason: 'Leadership depth' } as HiringMeta },
  { label: 'Offered', value: 72, meta: { medianDays: 14, topDeclineReason: 'Comp band negotiations' } as HiringMeta },
  { label: 'Accepted', value: 44, meta: { medianDays: 18 } as HiringMeta },
];

export const HIRING_SERIES = [
  {
    id: 'external-candidates',
    name: 'External candidates',
    steps: EXTERNAL_CANDIDATES,
  },
  {
    id: 'internal-transfers',
    name: 'Internal transfers',
    steps: INTERNAL_TRANSFERS,
  },
];

export const STEP_LOOKUP = new Map<any, { series: (typeof HIRING_SERIES)[number]; seriesIndex: number; stepIndex: number }>();
```

### Incident Response Workflow

```tsx
import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { INCIDENT_RESPONSE, IncidentMeta } from './data';

export function Demo() {
  return (
    <FunnelChart
      title="Incident response workflow"
      subtitle="Volume flowing through each stage"
      maw={520}
      h={460}
      series={INCIDENT_RESPONSE}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const idx = INCIDENT_RESPONSE.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = idx > 0 ? INCIDENT_RESPONSE.steps[idx - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as IncidentMeta | undefined;
          return [
            `${step.label}`,
            `${step.value.toLocaleString()} incidents`,
            meta?.medianDuration,
            previous ? `Drop since prior: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Start of workflow',
            meta?.automationWin ? `Automation impact: ${meta.automationWin}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export type IncidentMeta = {
  medianDuration?: string;
  automationWin?: string;
};

export const INCIDENT_RESPONSE = {
  id: 'incident-response',
  name: 'Incident response workflow',
  steps: [
    { label: 'Detection', value: 264, meta: { medianDuration: '4 min to detect' } as IncidentMeta },
    { label: 'Triage', value: 228, meta: { medianDuration: '16 min to triage', automationWin: 'Pager triage rules auto-close 32 low-signal alerts' } as IncidentMeta },
    { label: 'Containment', value: 182, meta: { medianDuration: '38 min to contain', automationWin: 'Runbooks auto-isolate hosts for 41% of cases' } as IncidentMeta },
    { label: 'Eradication', value: 164, meta: { medianDuration: '1.4 hr to resolve root cause' } as IncidentMeta },
    { label: 'Recovery', value: 158, meta: { medianDuration: '2.3 hr to restore services' } as IncidentMeta },
    { label: 'Review', value: 151, meta: { medianDuration: 'Completed within 48 hr SLA' } as IncidentMeta },
  ],
};
```

### Saas Trial Conversion

```tsx
import { FunnelChart, formatCompactNumber } from '@plocks/charts';

import { TRIAL_CONVERSION, TrialMeta } from './data';

export function Demo() {
  return (
    <FunnelChart
      title="SaaS trial-to-paid conversion"
      subtitle="Retention from sign-up to paid"
      maw={520}
      h={440}
      series={TRIAL_CONVERSION}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const index = TRIAL_CONVERSION.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = index > 0 ? TRIAL_CONVERSION.steps[index - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const reason = (step.meta as TrialMeta | undefined)?.dropReason;
          return [
            `${step.label}`,
            `${step.value.toLocaleString()} accounts`,
            previous ? `Drop: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Starting cohort',
            reason ? `Top reason: ${reason}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export type TrialMeta = {
  dropReason?: string;
};

export const TRIAL_CONVERSION = {
  id: 'trial-to-paid',
  name: 'Trial to paid conversion',
  steps: [
    { label: 'Sign-ups', value: 12800 },
    { label: 'Onboarded', value: 9100, meta: { dropReason: 'Setup friction and confusing success criteria' } as TrialMeta },
    { label: 'Week-1 active', value: 6200, meta: { dropReason: 'No team invites or connected data sources' } as TrialMeta },
    { label: 'Contracts', value: 2900, meta: { dropReason: 'Security review backlog and pricing clarity' } as TrialMeta },
    { label: 'Paid', value: 1850, meta: { dropReason: 'Budget timing & procurement approvals' } as TrialMeta },
  ],
};
```
