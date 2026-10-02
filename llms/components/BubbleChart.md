# Bubble Chart

Scatter-style plot where point radius encodes a third quantitative dimension.

## Metadata

- Import: `import { BubbleChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, bubble, scatter
- Docs: https://plocks.dev/charts/BubbleChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/BubbleChart

## Props

- `data` (required): T[] = [] — Dataset to render
- `dataKey` (required): BubbleChartDataKey<T> — Mapping between dataset keys and chart dimensions
- `range`: [number, number] = [36, 576] — Bubble area range (min/max) used to derive radius. Defaults to [36, 576].
- `minBubbleSize`: number — Optional minimum bubble radius override (px).
- `maxBubbleSize`: number — Optional maximum bubble radius override (px).
- `color`: string — Base fill color when data does not provide one.
- `colorScale`: BubbleColorScale<T> — Color bubbles by a field — a function, or a shared scale config over a numeric field.
- `bubbleOpacity`: number — Bubble fill opacity. Defaults to 0.85.
- `bubbleStrokeColor`: string = 'rgba(0,0,0,0.12)' — Bubble outline color.
- `bubbleStrokeWidth`: number = 1 — Bubble outline width. Defaults to 1.
- `textColor`: string — Axis/grid text color override.
- `gridColor`: string — Grid line color override.
- `label`: string — Optional label shown inside the plot area.
- `valueFormatter`: (value: number, record: T, index: number) => string — Custom formatter for bubble size values (tooltip + legend).
- `withTooltip`: boolean = true — Disable tooltip interactions. Defaults to true (tooltip enabled).
- `tooltip`: ChartTooltip<{ record: T; value: number; label: string; rawX: any; rawY: any; index: number; color: string; }> — Advanced tooltip configuration
- `grid`: ChartGrid | boolean = true — Supply custom grid configuration or disable grid entirely.
- `legend`: ChartLegend — Legend configuration.
- `xAxis`: ChartAxis = {} — X axis configuration (ticks, formatting, labels).
- `yAxis`: ChartAxis = {} — Y axis configuration (ticks, formatting, labels).

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface BubbleChartDataKey<T extends Record<string, any> = Record<string, any>> {
  /** Field name for x axis values */
  x: keyof T;
  /** Field name for y axis values */
  y: keyof T;
  /** Optional field name for bubble size values */
  z?: keyof T;
  /** Optional field giving label for this node */
  label?: keyof T;
  /** Optional field with color override per bubble */
  color?: keyof T;
  /** Optional field supplying stable id */
  id?: keyof T;
}

export type BubbleColorScale<T extends Record<string, any> = Record<string, any>> =
  | (ColorScaleConfig & { by?: 'color' | 'x' | 'y' | 'z' })
  | ((value: any, record: T, index: number) => string | undefined);
```

## Examples

### Basics

Scatter-style plot where point radius encodes a third quantitative dimension.

```tsx
import { BubbleChart } from '@plocks/charts';

import { companies } from './data';

export function Demo() {
  return (
    <BubbleChart
      title="Revenue vs Growth"
      subtitle="Bubble size shows valuation (in millions)"
      h={360}
      data={companies}
      dataKey={{
        x: 'revenue',
        y: 'growth',
        z: 'valuation',
        label: 'company',
        id: 'company',
      }}
      xAxis={{
        title: 'Annual revenue (USD millions)',
        labelFormatter: (value) => `${Math.round(value)}m`,
      }}
      yAxis={{
        title: 'YoY growth %',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      valueFormatter={(value) => `$${Math.round(value)}m`}
      grid={{ show: true }}
      withTooltip
      range={[64, 1152]}
    />
  );
}
```

`data.ts`

```ts
export const companies = [
  { company: 'Aster Labs', revenue: 320, growth: 28, valuation: 920 },
  { company: 'Blue Harbor', revenue: 180, growth: 35, valuation: 620 },
  { company: 'Canopy', revenue: 250, growth: 22, valuation: 710 },
  { company: 'Delta Systems', revenue: 140, growth: 44, valuation: 540 },
  { company: 'Elevate', revenue: 460, growth: 18, valuation: 1080 },
  { company: 'Fieldstone', revenue: 210, growth: 31, valuation: 680 },
  { company: 'Glowforge', revenue: 120, growth: 52, valuation: 480 },
  { company: 'Horizon', revenue: 390, growth: 24, valuation: 960 },
];
```

### Cities Talent Footprint

```tsx
import { BubbleChart } from '@plocks/charts';

import { Region, cities, regionPalette } from './data';

const formatFootprint = (value: number) => `${value.toFixed(0)}k sq ft`;

export function Demo() {
  return (
    <BubbleChart
      title="Global Talent Hubs"
      subtitle="Talent depth vs cost of living — bubble size represents active office footprint"
      h={440}
      data={cities}
      dataKey={{
        x: 'costOfLivingIndex',
        y: 'talentDepth',
        z: 'officeFootprintKsqft',
        label: 'city',
        color: 'region',
        id: 'city',
      }}
      colorScale={(value) => (value && regionPalette[value as Region]) || regionPalette.Americas}
      grid={{ show: true }}
      xAxis={{
        title: 'Cost of living index (base 100 = SF)',
        labelFormatter: (value) => value.toFixed(0),
      }}
      yAxis={{
        title: 'Tech talent depth (0–100 readiness)',
        labelFormatter: (value) => value.toFixed(0),
      }}
      valueFormatter={(value) => formatFootprint(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Office footprint: ${formatFootprint(value)}`,
          `Remote ready: ${record.remoteReady}% • Avg tenure: ${record.averageTenure.toFixed(1)} yrs`,
          `Anchor university: ${record.anchorUniversity}`,
        ].join('\n'),
      }}
      range={[81, 1764]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
```

`data.ts`

```ts
export type Region = 'Americas' | 'EMEA' | 'APAC';

export type CityProfile = {
  city: string;
  talentDepth: number;
  costOfLivingIndex: number;
  officeFootprintKsqft: number;
  remoteReady: number;
  averageTenure: number;
  region: Region;
  anchorUniversity: string;
};

export // Validated categorical palette slots (see charts colors.ts paletteDefaultLight).
const regionPalette: Record<Region, string> = {
  Americas: '#2a78d6',
  EMEA: '#eb6834',
  APAC: '#1baf7a',
};

export const cities: CityProfile[] = [
  { city: 'Austin', talentDepth: 78, costOfLivingIndex: 96, officeFootprintKsqft: 185, remoteReady: 68, averageTenure: 3.4, region: 'Americas', anchorUniversity: 'UT Austin' },
  { city: 'Toronto', talentDepth: 82, costOfLivingIndex: 104, officeFootprintKsqft: 150, remoteReady: 72, averageTenure: 3.1, region: 'Americas', anchorUniversity: 'University of Toronto' },
  { city: 'Berlin', talentDepth: 74, costOfLivingIndex: 88, officeFootprintKsqft: 120, remoteReady: 65, averageTenure: 2.9, region: 'EMEA', anchorUniversity: 'TU Berlin' },
  { city: 'Amsterdam', talentDepth: 76, costOfLivingIndex: 110, officeFootprintKsqft: 135, remoteReady: 70, averageTenure: 3.2, region: 'EMEA', anchorUniversity: 'University of Amsterdam' },
  { city: 'Singapore', talentDepth: 90, costOfLivingIndex: 134, officeFootprintKsqft: 210, remoteReady: 61, averageTenure: 3.8, region: 'APAC', anchorUniversity: 'NUS' },
  { city: 'Sydney', talentDepth: 69, costOfLivingIndex: 118, officeFootprintKsqft: 142, remoteReady: 64, averageTenure: 3.0, region: 'APAC', anchorUniversity: 'UNSW' },
  { city: 'Mexico City', talentDepth: 71, costOfLivingIndex: 74, officeFootprintKsqft: 95, remoteReady: 58, averageTenure: 2.6, region: 'Americas', anchorUniversity: 'UNAM' },
  { city: 'Warsaw', talentDepth: 67, costOfLivingIndex: 72, officeFootprintKsqft: 108, remoteReady: 60, averageTenure: 2.7, region: 'EMEA', anchorUniversity: 'Warsaw University of Technology' },
];
```

### Customer Account Health

```tsx
import { BubbleChart } from '@plocks/charts';

import { accounts } from './data';

const formatArr = (value: number) => `$${value.toFixed(2)}M ARR`;

export function Demo() {
  return (
    <BubbleChart
      title="Customer Account Health vs Expansion"
      subtitle="Bubble size reflects current ARR; use upper-right quadrant to spot ready-to-expand logos"
      h={440}
      data={accounts}
      dataKey={{
        x: 'healthScore',
        y: 'expansionPotential',
        z: 'arr',
        label: 'account',
        id: 'account',
      }}
      xAxis={{
        title: 'Account health score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Expansion potential score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      grid={{ show: true }}
      valueFormatter={(value) => formatArr(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          formatArr(value),
          `Segment: ${record.segment} • CSM: ${record.csOwner}`,
          `Last touch: ${record.lastTouch}`,
        ].join('\n'),
      }}
      range={[96, 1728]}
    />
  );
}
```

`data.ts`

```ts
export type Account = {
  account: string;
  healthScore: number;
  expansionPotential: number;
  arr: number;
  segment: 'Enterprise' | 'Mid-market' | 'Growth';
  csOwner: string;
  lastTouch: string;
};

export const accounts: Account[] = [
  { account: 'Acme Robotics', healthScore: 86, expansionPotential: 78, arr: 1.82, segment: 'Enterprise', csOwner: 'L. Howard', lastTouch: '4 days' },
  { account: 'Bluefin Media', healthScore: 63, expansionPotential: 72, arr: 0.96, segment: 'Mid-market', csOwner: 'A. Patel', lastTouch: '1 day' },
  { account: 'Cloudburst Analytics', healthScore: 92, expansionPotential: 88, arr: 2.35, segment: 'Enterprise', csOwner: 'C. Roman', lastTouch: '2 days' },
  { account: 'Driftwell', healthScore: 57, expansionPotential: 41, arr: 0.54, segment: 'Growth', csOwner: 'B. Ortiz', lastTouch: '6 days' },
  { account: 'Element Labs', healthScore: 74, expansionPotential: 67, arr: 1.22, segment: 'Mid-market', csOwner: 'T. Nguyen', lastTouch: 'Today' },
  { account: 'Fleetbase', healthScore: 48, expansionPotential: 83, arr: 0.81, segment: 'Growth', csOwner: 'D. Blake', lastTouch: '8 days' },
  { account: 'Horizon Capital', healthScore: 88, expansionPotential: 53, arr: 1.58, segment: 'Enterprise', csOwner: 'R. Chen', lastTouch: '3 days' },
  { account: 'Northwind Freight', healthScore: 69, expansionPotential: 91, arr: 1.44, segment: 'Mid-market', csOwner: 'S. Kim', lastTouch: '5 days' },
];
```

### Engineering Epic Risk

```tsx
import { BubbleChart } from '@plocks/charts';

import { Squad, epics, squadPalette } from './data';

const formatMultiplier = (value: number) => `${value.toFixed(1)}× risk`;

export function Demo() {
  return (
    <BubbleChart
      title="Epic Risk Landscape"
      subtitle="Story points vs defect density — bubble area communicates composite risk multiplier"
      h={420}
      data={epics}
      dataKey={{
        x: 'storyPoints',
        y: 'defectDensity',
        z: 'riskMultiplier',
        label: 'epic',
        color: 'squad',
        id: 'epic',
      }}
      colorScale={(value) => (value ? squadPalette[value as Squad] : squadPalette['Platform Reliability'])}
      grid={{ show: true }}
      xAxis={{
        title: 'Estimated effort (story points)',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Defect density (per 1000 lines)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      valueFormatter={(value) => formatMultiplier(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          formatMultiplier(value),
          `Critical paths: ${record.criticalPaths}`,
          `Squad: ${record.squad} • Phase: ${record.phase}`,
        ].join('\n'),
      }}
      range={[64, 1296]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
```

`data.ts`

```ts
export type Squad =
  | 'Platform Reliability'
  | 'Automation'
  | 'Security'
  | 'Mobile'
  | 'Monetization'
  | 'Enablement'
  | 'Observability'
  | 'FinOps';

export type Epic = {
  epic: string;
  storyPoints: number;
  defectDensity: number;
  riskMultiplier: number;
  criticalPaths: number;
  squad: Squad;
  phase: 'Design' | 'Build' | 'Stabilize';
};

export // Validated categorical palette slots (see charts colors.ts paletteDefaultLight).
const squadPalette: Record<Squad, string> = {
  'Platform Reliability': '#2a78d6',
  Automation: '#eb6834',
  Security: '#1baf7a',
  Mobile: '#eda100',
  Monetization: '#e87ba4',
  Enablement: '#008300',
  Observability: '#4a3aa7',
  FinOps: '#e34948',
};

export const epics: Epic[] = [
  { epic: 'Observability Agent v2', storyPoints: 210, defectDensity: 0.7, riskMultiplier: 3.1, criticalPaths: 4, squad: 'Platform Reliability', phase: 'Build' },
  { epic: 'Workflow Automation', storyPoints: 160, defectDensity: 0.5, riskMultiplier: 2.4, criticalPaths: 2, squad: 'Automation', phase: 'Design' },
  { epic: 'Data Residency Controls', storyPoints: 180, defectDensity: 0.9, riskMultiplier: 3.6, criticalPaths: 5, squad: 'Security', phase: 'Build' },
  { epic: 'Mobile Offline Sync', storyPoints: 120, defectDensity: 0.4, riskMultiplier: 2.1, criticalPaths: 1, squad: 'Mobile', phase: 'Build' },
  { epic: 'Billing Pipeline Rewrite', storyPoints: 240, defectDensity: 1.2, riskMultiplier: 4.4, criticalPaths: 6, squad: 'Monetization', phase: 'Stabilize' },
  { epic: 'Feature Flag Governance', storyPoints: 95, defectDensity: 0.3, riskMultiplier: 1.7, criticalPaths: 1, squad: 'Enablement', phase: 'Design' },
  { epic: 'Real-time Alerts', storyPoints: 140, defectDensity: 0.6, riskMultiplier: 2.5, criticalPaths: 3, squad: 'Observability', phase: 'Build' },
  { epic: 'Infra Cost Guardrails', storyPoints: 185, defectDensity: 0.8, riskMultiplier: 3.2, criticalPaths: 2, squad: 'FinOps', phase: 'Stabilize' },
];
```

### Product Strategy Portfolio

```tsx
import { BubbleChart } from '@plocks/charts';

import { initiatives } from './data';

const formatMillions = (value: number) => `$${value.toFixed(1)}M`;

export function Demo() {
  return (
    <BubbleChart
      title="Product Initiative Portfolio"
      subtitle="Strategic value vs execution effort — bubble scales with projected revenue"
      h={440}
      data={initiatives}
      dataKey={{
        x: 'executionEffort',
        y: 'strategicValue',
        z: 'projectedRevenue',
        label: 'initiative',
        id: 'initiative',
      }}
      grid={{ show: true }}
      xAxis={{
        title: 'Execution effort (1=low, 10=high)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      yAxis={{
        title: 'Strategic value (1=low, 10=high)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      valueFormatter={(value) => formatMillions(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Projected revenue: ${formatMillions(value)}`,
          `Confidence: ${record.confidence}%`,
          `Owner: ${record.owner} • Horizon: ${record.horizon}`,
        ].join('\n'),
      }}
      range={[72, 1440]}
    />
  );
}
```

`data.ts`

```ts
export type Initiative = {
  initiative: string;
  strategicValue: number;
  executionEffort: number;
  projectedRevenue: number;
  confidence: number;
  horizon: 'Now' | 'Next' | 'Later';
  owner: string;
};

export const initiatives: Initiative[] = [
  { initiative: 'Unified onboarding flow', strategicValue: 9.4, executionEffort: 3.2, projectedRevenue: 8.8, confidence: 76, horizon: 'Now', owner: 'Growth' },
  { initiative: 'Usage-based pricing', strategicValue: 8.6, executionEffort: 5.1, projectedRevenue: 9.7, confidence: 68, horizon: 'Next', owner: 'Monetization' },
  { initiative: 'AI-driven support', strategicValue: 7.9, executionEffort: 6.3, projectedRevenue: 6.9, confidence: 64, horizon: 'Next', owner: 'Support Ops' },
  { initiative: 'Insights dashboard revamp', strategicValue: 7.1, executionEffort: 4.5, projectedRevenue: 5.6, confidence: 72, horizon: 'Now', owner: 'Product Intelligence' },
  { initiative: 'Partner ecosystem API', strategicValue: 6.4, executionEffort: 7.8, projectedRevenue: 7.5, confidence: 54, horizon: 'Later', owner: 'Platform' },
  { initiative: 'In-app experimentation', strategicValue: 8.1, executionEffort: 3.9, projectedRevenue: 6.1, confidence: 82, horizon: 'Now', owner: 'Growth' },
  { initiative: 'Self-healing infrastructure', strategicValue: 9.1, executionEffort: 7.2, projectedRevenue: 5.4, confidence: 58, horizon: 'Later', owner: 'Core Engineering' },
  { initiative: 'Community templates marketplace', strategicValue: 6.8, executionEffort: 4.4, projectedRevenue: 4.9, confidence: 71, horizon: 'Next', owner: 'Ecosystem' },
];
```

### Vendor Contracts Scoring

```tsx
import { BubbleChart } from '@plocks/charts';

import { Category, categoryPalette, contracts } from './data';

const formatSpend = (value: number) => `$${value.toFixed(1)}M`;

export function Demo() {
  return (
    <BubbleChart
      title="Vendor Contract Health"
      subtitle="Compliance vs renewal probability — bubble area encodes annual spend"
      h={420}
      data={contracts}
      dataKey={{
        x: 'complianceScore',
        y: 'renewalProbability',
        z: 'annualSpendMillions',
        label: 'vendor',
        color: 'category',
        id: 'vendor',
      }}
      colorScale={(value) => (value && categoryPalette[value as Category]) || categoryPalette.Cloud}
      grid={{ show: true }}
      xAxis={{
        title: 'Compliance readiness score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Renewal probability %',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      valueFormatter={(value) => formatSpend(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Annual spend: ${formatSpend(value)}`,
          `Owner: ${record.owner} • Term ends: ${record.termEnds}`,
          `Risk: ${record.riskLevel}`,
        ].join('\n'),
      }}
      range={[72, 1620]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
```

`data.ts`

```ts
export type Category = 'Cloud' | 'Security' | 'Data' | 'Productivity';

export type VendorContract = {
  vendor: string;
  complianceScore: number;
  renewalProbability: number;
  annualSpendMillions: number;
  category: Category;
  owner: string;
  termEnds: string;
  riskLevel: 'Low' | 'Medium' | 'High';
};

export // Validated categorical palette slots (see charts colors.ts paletteDefaultLight).
const categoryPalette: Record<Category, string> = {
  Cloud: '#2a78d6',
  Security: '#eb6834',
  Data: '#1baf7a',
  Productivity: '#eda100',
};

export const contracts: VendorContract[] = [
  { vendor: 'Atlas Cloud', complianceScore: 94, renewalProbability: 88, annualSpendMillions: 4.8, category: 'Cloud', owner: 'Infra Ops', termEnds: 'FY26 Q2', riskLevel: 'Low' },
  { vendor: 'ShieldGuard', complianceScore: 82, renewalProbability: 64, annualSpendMillions: 3.1, category: 'Security', owner: 'Security', termEnds: 'FY25 Q4', riskLevel: 'Medium' },
  { vendor: 'InsightLake', complianceScore: 90, renewalProbability: 79, annualSpendMillions: 2.6, category: 'Data', owner: 'Analytics', termEnds: 'FY25 Q3', riskLevel: 'Low' },
  { vendor: 'FlowSuite', complianceScore: 76, renewalProbability: 72, annualSpendMillions: 1.9, category: 'Productivity', owner: 'Workplace', termEnds: 'FY25 Q1', riskLevel: 'Medium' },
  { vendor: 'SentinelOne', complianceScore: 88, renewalProbability: 54, annualSpendMillions: 3.8, category: 'Security', owner: 'Security', termEnds: 'FY26 Q1', riskLevel: 'High' },
  { vendor: 'Nimbus Edge', complianceScore: 70, renewalProbability: 48, annualSpendMillions: 2.4, category: 'Cloud', owner: 'Infra Ops', termEnds: 'FY24 Q4', riskLevel: 'High' },
  { vendor: 'DataForge', complianceScore: 86, renewalProbability: 83, annualSpendMillions: 2.9, category: 'Data', owner: 'Analytics', termEnds: 'FY26 Q4', riskLevel: 'Low' },
  { vendor: 'CollabSphere', complianceScore: 92, renewalProbability: 91, annualSpendMillions: 3.5, category: 'Productivity', owner: 'Workplace', termEnds: 'FY27 Q1', riskLevel: 'Low' },
];
```
