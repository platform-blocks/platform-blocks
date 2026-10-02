# Sankey Chart

Flow diagram showing volume between nodes.

## Metadata

- Import: `import { SankeyChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, flow, sankey
- Docs: https://plocks.dev/charts/SankeyChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/SankeyChart

## Props

- `nodes` (required): SankeyNode[] — Nodes included in the Sankey diagram
- `links` (required): SankeyLink[] — Links connecting the nodes
- `animationDuration`: number = 1000 — Animation duration in milliseconds
- `disabled`: boolean = false — Disable animations
- `nodeWidth`: number — Fixed node width in pixels (auto-calculated if omitted)
- `nodePadding`: number — Vertical gap between nodes (auto-calculated if omitted)
- `chartPadding`: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>> — Override chart padding (defaults to 40px all around)
- `labelFormatter`: (node: SankeyNode) => string — Format display label for a node
- `valueFormatter`: (value: number, node: SankeyNode | undefined) => string — Format value label for a node
- `onNodeHover`: (node: SankeyNode | null) => void — Receive callbacks when a node is hovered/focused
- `onLinkHover`: (link: SankeyLink | null) => void — Receive callbacks when a link is hovered/focused
- `highlightOnHover`: boolean = true — Highlight hovered nodes/links (defaults to true)
- `onDataInconsistency`: (issues: SankeyInconsistency[]) => void — Surfaced when inbound/outbound totals differ for a node

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationEasing` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface SankeyNode {
  /** Unique identifier for the node */
  id: string;
  /** Display name for the node */
  name?: string;
  /** Numeric value associated with the node */
  value?: number;
  /** Color override for the node */
  color?: string;
  /** Additional metadata associated with the node */
  meta?: any;
}

export interface SankeyLink {
  /** Source node identifier */
  source: string;
  /** Target node identifier */
  target: string;
  /** Magnitude of the flow */
  value: number;
  /** Color override for the link */
  color?: string;
  /** Additional metadata associated with the link */
  meta?: any;
}

export interface SankeyInconsistency {
  nodeId: string;
  inbound: number;
  outbound: number;
}
```

## Examples

### Basics

Flow diagram showing volume between nodes.

```tsx
import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<SankeyChart
			title="Renewable energy flow"
			h={360}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
```

`data.ts`

```ts
export const NODES = [
	{ id: 'solar', name: 'Solar' },
	{ id: 'wind', name: 'Wind' },
	{ id: 'hydro', name: 'Hydro' },
	{ id: 'grid', name: 'Grid' },
	{ id: 'battery', name: 'Battery Storage' },
	{ id: 'residential', name: 'Residential' },
	{ id: 'commercial', name: 'Commercial' },
	{ id: 'industrial', name: 'Industrial' },
];

export const LINKS = [
	{ source: 'solar', target: 'grid', value: 32 },
	{ source: 'wind', target: 'grid', value: 28 },
	{ source: 'hydro', target: 'grid', value: 18 },
	{ source: 'solar', target: 'battery', value: 6 },
	{ source: 'wind', target: 'battery', value: 4 },
	{ source: 'battery', target: 'grid', value: 8 },
	{ source: 'grid', target: 'residential', value: 30 },
	{ source: 'grid', target: 'commercial', value: 24 },
	{ source: 'grid', target: 'industrial', value: 16 },
];
```

### Budget Allocation

```tsx
import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Budget allocation flow"
      subtitle="FY26 operating plan"
      h={400}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

`data.ts`

```ts
export const NODES = [
  { id: 'corporate-budget', name: 'Corporate Budget' },
  { id: 'gtm', name: 'Go-to-Market' },
  { id: 'product', name: 'Product & Engineering' },
  { id: 'operations', name: 'Operations' },
  { id: 'paid-media', name: 'Paid Media' },
  { id: 'events', name: 'Events' },
  { id: 'product-investment', name: 'Product Investment' },
  { id: 'platform-modernization', name: 'Platform Modernization' },
  { id: 'customer-success', name: 'Customer Success' },
  { id: 'supply-chain', name: 'Supply Chain' },
];

export const LINKS = [
  { source: 'corporate-budget', target: 'gtm', value: 24 },
  { source: 'corporate-budget', target: 'product', value: 32 },
  { source: 'corporate-budget', target: 'operations', value: 18 },
  { source: 'gtm', target: 'paid-media', value: 12 },
  { source: 'gtm', target: 'events', value: 8 },
  { source: 'gtm', target: 'customer-success', value: 4 },
  { source: 'product', target: 'product-investment', value: 14 },
  { source: 'product', target: 'platform-modernization', value: 12 },
  { source: 'operations', target: 'customer-success', value: 6 },
  { source: 'operations', target: 'supply-chain', value: 10 },
];
```

### Cloud Provisioning

```tsx
import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Cloud provisioning workflow"
      subtitle="Quarterly environment requests"
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

`data.ts`

```ts
export const NODES = [
  { id: 'request', name: 'Service Request' },
  { id: 'security-review', name: 'Security Review' },
  { id: 'infra-approval', name: 'Infra Approval' },
  { id: 'dev-env', name: 'Dev Cluster' },
  { id: 'staging-env', name: 'Staging Cluster' },
  { id: 'prod-env', name: 'Prod Cluster' },
  { id: 'kubernetes', name: 'Kubernetes Workloads' },
  { id: 'serverless', name: 'Serverless Jobs' },
  { id: 'databases', name: 'Managed Databases' },
];

export const LINKS = [
  { source: 'request', target: 'security-review', value: 60 },
  { source: 'request', target: 'infra-approval', value: 20 },
  { source: 'security-review', target: 'infra-approval', value: 55 },
  { source: 'infra-approval', target: 'dev-env', value: 28 },
  { source: 'infra-approval', target: 'staging-env', value: 20 },
  { source: 'infra-approval', target: 'prod-env', value: 27 },
  { source: 'dev-env', target: 'kubernetes', value: 16 },
  { source: 'dev-env', target: 'serverless', value: 6 },
  { source: 'dev-env', target: 'databases', value: 6 },
  { source: 'staging-env', target: 'kubernetes', value: 10 },
  { source: 'staging-env', target: 'serverless', value: 4 },
  { source: 'staging-env', target: 'databases', value: 6 },
  { source: 'prod-env', target: 'kubernetes', value: 12 },
  { source: 'prod-env', target: 'serverless', value: 7 },
  { source: 'prod-env', target: 'databases', value: 8 },
];
```

### Customer Journey

```tsx
import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Customer journey flow"
      subtitle="Q3 acquisition to retention"
      h={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

`data.ts`

```ts
export const NODES = [
  { id: 'paid-social', name: 'Paid Social' },
  { id: 'organic-search', name: 'Organic Search' },
  { id: 'email', name: 'Email Nurture' },
  { id: 'events', name: 'Field Events' },
  { id: 'signup', name: 'Sign Up' },
  { id: 'trial', name: 'Trial Activation' },
  { id: 'purchase', name: 'Purchase', color: '#10B981' },
  { id: 'churn', name: 'Churn', color: '#EF4444' },
  { id: 'retain', name: 'Retained' },
];

export const LINKS = [
  { source: 'paid-social', target: 'signup', value: 320 },
  { source: 'organic-search', target: 'signup', value: 420 },
  { source: 'email', target: 'signup', value: 180 },
  { source: 'events', target: 'signup', value: 140 },
  { source: 'signup', target: 'trial', value: 760 },
  { source: 'trial', target: 'purchase', value: 410 },
  { source: 'trial', target: 'churn', value: 350 },
  { source: 'purchase', target: 'retain', value: 290 },
  { source: 'purchase', target: 'churn', value: 120 },
];
```

### Data Lineage

```tsx
import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Analytics data lineage"
      subtitle="Daily load pipeline"
      h={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

`data.ts`

```ts
export const NODES = [
  { id: 'crm', name: 'CRM' },
  { id: 'product-analytics', name: 'Product Analytics' },
  { id: 'billing', name: 'Billing' },
  { id: 'raw-zone', name: 'Raw Zone' },
  { id: 'staging', name: 'Staging' },
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'marts', name: 'Analytics Marts' },
  { id: 'dashboards', name: 'Executive Dashboards' },
  { id: 'cs-insights', name: 'CS Insights' },
  { id: 'ml-feature-store', name: 'ML Feature Store' },
];

export const LINKS = [
  { source: 'crm', target: 'raw-zone', value: 420 },
  { source: 'product-analytics', target: 'raw-zone', value: 360 },
  { source: 'billing', target: 'raw-zone', value: 280 },
  { source: 'raw-zone', target: 'staging', value: 900 },
  { source: 'staging', target: 'warehouse', value: 860 },
  { source: 'warehouse', target: 'marts', value: 540 },
  { source: 'warehouse', target: 'ml-feature-store', value: 320 },
  { source: 'marts', target: 'dashboards', value: 340 },
  { source: 'marts', target: 'cs-insights', value: 180 },
  { source: 'ml-feature-store', target: 'cs-insights', value: 120 },
];
```

### Talent Pipeline

```tsx
import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Engineering talent pipeline"
      subtitle="Campus + lateral hiring"
      h={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

`data.ts`

```ts
export const NODES = [
  { id: 'campus', name: 'Campus Recruiting' },
  { id: 'bootcamp', name: 'Bootcamp Partners' },
  { id: 'referrals', name: 'Employee Referrals' },
  { id: 'internal', name: 'Internal Mobility' },
  { id: 'screening', name: 'Recruiter Screen' },
  { id: 'technical', name: 'Technical Interview' },
  { id: 'onsite', name: 'Onsite Panel' },
  { id: 'offer', name: 'Offer Stage' },
  { id: 'accepted', name: 'Accepted Offers', color: '#10B981' },
  { id: 'screening-drop', name: 'Screen Drops', color: '#EF4444' },
  { id: 'technical-drop', name: 'Technical Drops', color: '#DC2626' },
  { id: 'onsite-drop', name: 'Onsite Declines', color: '#B91C1C' },
  { id: 'offer-decline', name: 'Offer Declined', color: '#F43F5E' },
  { id: 'product-eng', name: 'Product Engineering' },
  { id: 'platform-eng', name: 'Platform Engineering' },
  { id: 'data-science', name: 'Data Science' },
];

export const LINKS = [
  { source: 'campus', target: 'screening', value: 120 },
  { source: 'bootcamp', target: 'screening', value: 80 },
  { source: 'referrals', target: 'technical', value: 60 },
  { source: 'internal', target: 'technical', value: 30 },
  { source: 'screening', target: 'technical', value: 190 },
  { source: 'screening', target: 'screening-drop', value: 10 },
  { source: 'technical', target: 'onsite', value: 210 },
  { source: 'technical', target: 'technical-drop', value: 70 },
  { source: 'onsite', target: 'offer', value: 180 },
  { source: 'onsite', target: 'onsite-drop', value: 30 },
  { source: 'offer', target: 'accepted', value: 140 },
  { source: 'offer', target: 'offer-decline', value: 40 },
  { source: 'accepted', target: 'product-eng', value: 60 },
  { source: 'accepted', target: 'platform-eng', value: 45 },
  { source: 'accepted', target: 'data-science', value: 35 },
];
```
