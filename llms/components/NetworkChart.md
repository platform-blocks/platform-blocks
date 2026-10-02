# Network Chart

NetworkChart visualizes relationships among nodes and links.

## Metadata

- Import: `import { NetworkChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, network, graph
- Docs: https://plocks.dev/charts/NetworkChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/NetworkChart

## Props

- `nodes` (required): NetworkNode[] — Nodes to render in the network
- `links` (required): NetworkLink[] — Links connecting the nodes
- `layout`: 'force' | 'coordinate' | 'circular' | 'radial' = 'force' — Layout engine mode
- `grid`: ChartGrid | boolean — Optional grid configuration for coordinate layouts
- `xAxis`: ChartAxis — X axis configuration when using coordinate layouts
- `yAxis`: ChartAxis — Y axis configuration when using coordinate layouts
- `padding`: Partial<{ top: number; right: number; bottom: number; left: number }> — Optional padding overrides
- `coordinateAccessor`: { x?: (node: NetworkNode, index: number) => number; y?: (node: NetworkNode, index: number) => number; } — Accessor overrides for coordinate layouts
- `showLabels`: boolean = true — Show node labels
- `nodeRadius`: number = 12 — Radius override for nodes
- `nodeRadiusRange`: [number, number] — Optional range that scales node radius by node value
- `nodeValueAccessor`: (node: NetworkNode, index: number) => number — Optional accessor to extract numeric value for node sizing
- `linkWidthRange`: [number, number] — Optional range that maps link weights to stroke width
- `linkColorAccessor`: (link: NetworkLink, index: number) => string | undefined — Accessor for custom link colors
- `linkOpacityAccessor`: (link: NetworkLink, index: number) => number | undefined — Accessor for custom link opacity
- `linkShape`: 'straight' | 'curved' — Link rendering shape
- `linkCurveStrength`: number — Curvature strength multiplier when using curved links
- `linkPalette`: string[] — Palette used when a link does not provide an explicit color
- `onNodeFocus`: (event: NetworkNodeInteractionEvent) => void — Node focus callback for hover/focus interactions
- `onNodeBlur`: (event: NetworkNodeInteractionEvent) => void — Node blur callback
- `onNodePress`: (event: NetworkNodeInteractionEvent) => void — Node press callback
- `onLinkFocus`: (event: NetworkLinkInteractionEvent) => void — Link focus callback for hover/focus interactions
- `onLinkBlur`: (event: NetworkLinkInteractionEvent) => void — Link blur callback
- `onLinkPress`: (event: NetworkLinkInteractionEvent) => void — Link press callback

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface NetworkNode {
  /** Unique identifier for the node */
  id: string;
  /** Display name for the node */
  name?: string;
  /** Optional grouping key used for styling */
  group?: string | number;
  /** Numeric value associated with the node */
  value?: number;
  /** Explicit color override for the node */
  color?: string;
  /** Additional metadata associated with the node */
  meta?: any;
  /** Optional X coordinate for coordinate layouts */
  x?: number;
  /** Optional Y coordinate for coordinate layouts */
  y?: number;
}

export interface NetworkLink {
  /** ID of the source node */
  source: string;
  /** ID of the target node */
  target: string;
  /** Strength or weight of the connection */
  weight?: number;
  /** Additional metadata associated with the link */
  meta?: any;
  /** Optional color override for the link */
  color?: string;
  /** Optional opacity override for the link */
  opacity?: number;
  /** Explicit stroke width override for the link */
  width?: number;
}

export interface NetworkNodeInteractionEvent {
  node: NetworkNode;
  index: number;
  position: { x: number; y: number };
}

export interface NetworkLinkInteractionEvent {
  link: NetworkLink;
  index: number;
  source: { node?: NetworkNode; position: { x: number; y: number } };
  target: { node?: NetworkNode; position: { x: number; y: number } };
  weight: number;
}
```

## Examples

### Basics

NetworkChart visualizes relationships among nodes and links.

```tsx
import { NetworkChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<NetworkChart
			title="Cross-team collaboration"
			h={460}
			layout="circular"
			nodes={NODES}
			links={LINKS}
		/>
	);
}
```

`data.ts`

```ts
export const NODES = [
	{ id: 'product', name: 'Product', group: 'teams', value: 12 },
	{ id: 'design', name: 'Design', group: 'teams', value: 8 },
	{ id: 'engineering', name: 'Engineering', group: 'teams', value: 18 },
	{ id: 'marketing', name: 'Marketing', group: 'teams', value: 10 },
	{ id: 'sales', name: 'Sales', group: 'teams', value: 9 },
	{ id: 'support', name: 'Support', group: 'teams', value: 7 },
	{ id: 'platform', name: 'Platform', group: 'initiatives', value: 15 },
	{ id: 'ai', name: 'AI', group: 'initiatives', value: 11 },
];

export const LINKS = [
	{ source: 'platform', target: 'engineering', value: 6 },
	{ source: 'platform', target: 'product', value: 5 },
	{ source: 'platform', target: 'support', value: 2 },
	{ source: 'ai', target: 'product', value: 4 },
	{ source: 'ai', target: 'marketing', value: 3 },
	{ source: 'ai', target: 'sales', value: 2 },
	{ source: 'product', target: 'design', value: 7 },
	{ source: 'product', target: 'engineering', value: 8 },
	{ source: 'marketing', target: 'sales', value: 5 },
	{ source: 'support', target: 'sales', value: 4 },
];
```

### Customer Referral Network

```tsx
import { NetworkChart } from '@plocks/charts';

import { COHORTS, REFERRALS } from './data';

const waveToColor = (wave?: number) => {
  if (wave === 1) return '#34C759';
  if (wave === 2) return '#4DABF7';
  if (wave === 3) return '#FF922B';
  return '#ADB5BD';
};

const waveToOpacity = (wave?: number) => {
  if (wave === 1) return 0.7;
  if (wave === 2) return 0.6;
  if (wave === 3) return 0.55;
  return 0.45;
};

export function Demo() {
  return (
    <NetworkChart
      title="Customer referral influence network"
      subtitle="Referral pathways by activation wave"
      h={430}
      nodes={COHORTS}
      links={REFERRALS}
      showLabels
      nodeRadius={13}
      nodeRadiusRange={[11, 25]}
      linkWidthRange={[1, 3.6]}
      linkColorAccessor={(link) => waveToColor(typeof link.meta?.wave === 'number' ? link.meta.wave : Number(link.meta?.wave))}
      linkOpacityAccessor={(link) => waveToOpacity(typeof link.meta?.wave === 'number' ? link.meta.wave : Number(link.meta?.wave))}
    />
  );
}
```

`data.ts`

```ts
import type { NetworkLink, NetworkNode } from '@plocks/charts';

export const COHORTS: NetworkNode[] = [
  { id: 'seed-advocates', name: 'Seed Advocates', group: 'seed', value: 38 },
  { id: 'growth-us', name: 'Growth - US', group: 'growth', value: 44 },
  { id: 'growth-eu', name: 'Growth - EU', group: 'growth', value: 36 },
  { id: 'enterprise-wave', name: 'Enterprise Wave', group: 'enterprise', value: 29 },
  { id: 'partner-ecosystem', name: 'Partner Ecosystem', group: 'partners', value: 24 },
  { id: 'freemium-community', name: 'Freemium Community', group: 'seed', value: 50 },
  { id: 'latam-expansion', name: 'LATAM Expansion', group: 'growth', value: 31 },
];

export const REFERRALS: NetworkLink[] = [
  { source: 'seed-advocates', target: 'freemium-community', weight: 6.4, meta: { wave: 1 } },
  { source: 'seed-advocates', target: 'growth-us', weight: 4.7, meta: { wave: 1 } },
  { source: 'freemium-community', target: 'growth-eu', weight: 3.8, meta: { wave: 2 } },
  { source: 'growth-us', target: 'enterprise-wave', weight: 3.3, meta: { wave: 2 } },
  { source: 'growth-eu', target: 'enterprise-wave', weight: 2.6, meta: { wave: 3 } },
  { source: 'partner-ecosystem', target: 'enterprise-wave', weight: 3.9, meta: { wave: 1 } },
  { source: 'partner-ecosystem', target: 'growth-us', weight: 2.4, meta: { wave: 2 } },
  { source: 'latam-expansion', target: 'growth-eu', weight: 3.2, meta: { wave: 2 } },
  { source: 'latam-expansion', target: 'freemium-community', weight: 2.7, meta: { wave: 3 } },
];
```

### Knowledge Sharing Connections

```tsx
import { useState, useMemo } from 'react';
import { Text } from 'react-native';
import { NetworkChart } from '@plocks/charts';

import { MENTORSHIPS, TEAMS } from './data';

const linkColorByType = (type: string | undefined) => {
  switch (type) {
    case 'cross-team':
      return '#5F3DC4';
    case 'program':
      return '#1971C2';
    case 'rotation':
      return '#FFA94D';
    case 'pairing':
      return '#15AABF';
    default:
      return '#ADB5BD';
  }
};

const linkOpacityByType = (type: string | undefined) => {
  switch (type) {
    case 'cross-team':
      return 0.72;
    case 'program':
      return 0.6;
    case 'rotation':
      return 0.55;
    case 'pairing':
      return 0.5;
    default:
      return 0.45;
  }
};

export function Demo() {
  const [focusDetail, setFocusDetail] = useState<string | null>(null);

  const highlightText = useMemo(() => focusDetail, [focusDetail]);

  return (
    <>
      <NetworkChart
        title="Knowledge sharing mentorship graph"
        subtitle="Monthly mentorship hours across guild programs"
        h={440}
        layout="radial"
        nodes={TEAMS}
        links={MENTORSHIPS}
        showLabels
        nodeRadius={14}
        nodeRadiusRange={[12, 26]}
        linkWidthRange={[1.1, 3.8]}
        linkShape="curved"
        linkCurveStrength={0.38}
        linkPalette={['#7048E8', '#4263EB', '#0CA678', '#F08C00']}
        linkColorAccessor={(link) => linkColorByType(link.meta?.type)}
        linkOpacityAccessor={(link) => linkOpacityByType(link.meta?.type)}
        onNodeFocus={(event) =>
          setFocusDetail(
            `${event.node.name ?? event.node.id} • ${Math.round(event.node.value ?? 0)} active mentorship hours`
          )
        }
        onNodeBlur={() => setFocusDetail(null)}
        onLinkFocus={(event) => {
          const sourceName = event.source.node?.name ?? event.link.source;
          const targetName = event.target.node?.name ?? event.link.target;
          setFocusDetail(`${sourceName} mentoring ${targetName}`);
        }}
        onLinkBlur={() => setFocusDetail(null)}
      />
      {highlightText && (
        <Text style={{ marginTop: 12, fontSize: 12, color: '#495057' }}>{highlightText}</Text>
      )}
    </>
  );
}
```

`data.ts`

```ts
import type { NetworkLink, NetworkNode } from '@plocks/charts';

export const TEAMS: NetworkNode[] = [
  { id: 'design-guild', name: 'Design Guild', group: 'product', value: 36 },
  { id: 'frontend', name: 'Frontend', group: 'engineering', value: 52 },
  { id: 'backend', name: 'Platform API', group: 'engineering', value: 58 },
  { id: 'data-science', name: 'Data Science', group: 'analytics', value: 41 },
  { id: 'product-management', name: 'Product Management', group: 'product', value: 47 },
  { id: 'customer-success', name: 'Customer Success', group: 'go-to-market', value: 33 },
  { id: 'devrel', name: 'DevRel', group: 'growth', value: 26 },
];

export const MENTORSHIPS: NetworkLink[] = [
  { source: 'frontend', target: 'design-guild', weight: 6.5, meta: { type: 'cross-team' } },
  { source: 'backend', target: 'frontend', weight: 7.2, meta: { type: 'pairing' } },
  { source: 'backend', target: 'data-science', weight: 4.1, meta: { type: 'cross-team' } },
  { source: 'product-management', target: 'design-guild', weight: 5.4, meta: { type: 'program' } },
  { source: 'product-management', target: 'customer-success', weight: 3.7, meta: { type: 'rotation' } },
  { source: 'devrel', target: 'frontend', weight: 2.9, meta: { type: 'cross-team' } },
  { source: 'devrel', target: 'customer-success', weight: 3.4, meta: { type: 'program' } },
  { source: 'data-science', target: 'product-management', weight: 4.6, meta: { type: 'pairing' } },
  { source: 'customer-success', target: 'design-guild', weight: 2.7, meta: { type: 'rotation' } },
];
```

### Microservice Latency

```tsx
import { NetworkChart } from '@plocks/charts';

import { DEPENDENCIES, SERVICES } from './data';

const latencyToColor = (latency: number) => {
  if (latency <= 150) return '#12B886';
  if (latency <= 220) return '#FAB005';
  return '#FA5252';
};

const latencyToOpacity = (latency: number) => {
  if (latency >= 250) return 0.9;
  if (latency >= 200) return 0.7;
  return 0.5;
};

export function Demo() {
  return (
    <NetworkChart
      title="Microservice latency map"
      subtitle="Edge-to-core call graph with weighted latency"
      h={460}
      nodes={SERVICES}
      links={DEPENDENCIES}
      showLabels
      nodeRadius={12}
      nodeRadiusRange={[10, 28]}
      linkWidthRange={[1.2, 4.6]}
  linkColorAccessor={(link) => latencyToColor(Number(link.meta?.latency ?? 0))}
  linkOpacityAccessor={(link) => latencyToOpacity(Number(link.meta?.latency ?? 0))}
    />
  );
}
```

`data.ts`

```ts
import type { NetworkLink, NetworkNode } from '@plocks/charts';

export const SERVICES: NetworkNode[] = [
  { id: 'api-gateway', name: 'API Gateway', group: 'edge', value: 420 },
  { id: 'auth-service', name: 'Auth', group: 'core', value: 260 },
  { id: 'catalog-service', name: 'Catalog', group: 'core', value: 310 },
  { id: 'payment-service', name: 'Payments', group: 'revenue', value: 280 },
  { id: 'notification-service', name: 'Notifications', group: 'engagement', value: 190 },
  { id: 'search-service', name: 'Search', group: 'experience', value: 240 },
  { id: 'analytics-service', name: 'Analytics', group: 'insights', value: 210 },
  { id: 'inventory-service', name: 'Inventory', group: 'ops', value: 330 },
];

export const DEPENDENCIES: NetworkLink[] = [
  { source: 'api-gateway', target: 'auth-service', weight: 9.5, meta: { latency: 95 } },
  { source: 'api-gateway', target: 'catalog-service', weight: 8.2, meta: { latency: 132 } },
  { source: 'api-gateway', target: 'payment-service', weight: 7.1, meta: { latency: 214 } },
  { source: 'catalog-service', target: 'inventory-service', weight: 6.4, meta: { latency: 186 } },
  { source: 'catalog-service', target: 'search-service', weight: 5.5, meta: { latency: 158 } },
  { source: 'payment-service', target: 'auth-service', weight: 4.2, meta: { latency: 248 } },
  { source: 'payment-service', target: 'analytics-service', weight: 3.6, meta: { latency: 276 } },
  { source: 'notification-service', target: 'api-gateway', weight: 4.4, meta: { latency: 146 } },
  { source: 'analytics-service', target: 'notification-service', weight: 3.2, meta: { latency: 182 } },
  { source: 'analytics-service', target: 'catalog-service', weight: 2.8, meta: { latency: 224 } },
];
```

### Risk Propagation

```tsx
import { NetworkChart } from '@plocks/charts';

import { PROPAGATION, SYSTEMS } from './data';

const severityToColor = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return '#FA5252';
    case 'major':
      return '#FD7E14';
    case 'minor':
      return '#FAB005';
    default:
      return '#ADB5BD';
  }
};

const severityToOpacity = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 0.88;
    case 'major':
      return 0.68;
    case 'minor':
      return 0.55;
    default:
      return 0.45;
  }
};

export function Demo() {
  return (
    <NetworkChart
      title="Risk propagation path"
      subtitle="Simulated attack progression across services"
      h={420}
      nodes={SYSTEMS}
      links={PROPAGATION}
      showLabels
      nodeRadius={12}
      nodeRadiusRange={[10, 26]}
      linkWidthRange={[1.1, 3.9]}
      linkColorAccessor={(link) => severityToColor(link.meta?.severity)}
      linkOpacityAccessor={(link) => severityToOpacity(link.meta?.severity)}
    />
  );
}
```

`data.ts`

```ts
import type { NetworkLink, NetworkNode } from '@plocks/charts';

export const SYSTEMS: NetworkNode[] = [
  { id: 'edge-firewall', name: 'Edge Firewall', group: 'perimeter', value: 34 },
  { id: 'api-gateway', name: 'API Gateway', group: 'perimeter', value: 48 },
  { id: 'auth-service', name: 'Auth Service', group: 'identity', value: 62 },
  { id: 'service-mesh', name: 'Service Mesh', group: 'platform', value: 55 },
  { id: 'data-lake', name: 'Data Lake', group: 'data', value: 74 },
  { id: 'billing-system', name: 'Billing', group: 'finance', value: 80 },
  { id: 'support-portal', name: 'Support Portal', group: 'customer', value: 46 },
];

export const PROPAGATION: NetworkLink[] = [
  { source: 'edge-firewall', target: 'api-gateway', weight: 5.6, meta: { severity: 'major' } },
  { source: 'api-gateway', target: 'auth-service', weight: 4.2, meta: { severity: 'critical' } },
  { source: 'auth-service', target: 'service-mesh', weight: 3.5, meta: { severity: 'major' } },
  { source: 'service-mesh', target: 'data-lake', weight: 3.1, meta: { severity: 'critical' } },
  { source: 'data-lake', target: 'billing-system', weight: 2.8, meta: { severity: 'critical' } },
  { source: 'billing-system', target: 'support-portal', weight: 2.4, meta: { severity: 'major' } },
  { source: 'edge-firewall', target: 'support-portal', weight: 2.9, meta: { severity: 'minor' } },
  { source: 'service-mesh', target: 'support-portal', weight: 2.2, meta: { severity: 'minor' } },
];
```

### Supply Chain Relationships

```tsx
import { NetworkChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

const riskToColor = (risk?: string) => {
  switch (risk) {
    case 'high':
      return '#FA5252';
    case 'medium':
      return '#FCC419';
    case 'low':
      return '#51CF66';
    default:
      return '#ADB5BD';
  }
};

const riskToOpacity = (risk?: string) => {
  switch (risk) {
    case 'high':
      return 0.85;
    case 'medium':
      return 0.65;
    case 'low':
      return 0.55;
    default:
      return 0.45;
  }
};

export function Demo() {
  return (
    <NetworkChart
      title="Supply chain relationship map"
      subtitle="Tiered flow from suppliers to regional distribution"
      h={440}
      layout="coordinate"
      nodes={NODES}
      links={LINKS}
      showLabels
      nodeRadius={12}
      nodeRadiusRange={[10, 24]}
      linkWidthRange={[1.2, 4.2]}
      linkColorAccessor={(link) => riskToColor(link.meta?.risk)}
      linkOpacityAccessor={(link) => riskToOpacity(link.meta?.risk)}
      grid={false}
      xAxis={{ show: false }}
      yAxis={{ show: false }}
    />
  );
}
```

`data.ts`

```ts
import type { NetworkLink, NetworkNode } from '@plocks/charts';

export const suppliers = (
  [
    { id: 'supplier-a', name: 'Supplier A', value: 68 },
    { id: 'supplier-b', name: 'Supplier B', value: 54 },
    { id: 'supplier-c', name: 'Supplier C', value: 46 },
  ] satisfies Array<Omit<NetworkNode, 'group'>>
).map((node, index) => ({
  ...node,
  group: 'supplier',
  x: 0,
  y: index * 80,
}));

export const manufacturers = (
  [
    { id: 'plant-north', name: 'Plant - North', value: 82 },
    { id: 'plant-central', name: 'Plant - Central', value: 76 },
    { id: 'plant-south', name: 'Plant - South', value: 64 },
  ] satisfies Array<Omit<NetworkNode, 'group'>>
).map((node, index) => ({
  ...node,
  group: 'manufacturer',
  x: 1,
  y: index * 80 + 30,
}));

export const distribution = (
  [
    { id: 'dc-west', name: 'DC West', value: 58 },
    { id: 'dc-east', name: 'DC East', value: 72 },
    { id: 'dc-emea', name: 'DC EMEA', value: 49 },
  ] satisfies Array<Omit<NetworkNode, 'group'>>
).map((node, index) => ({
  ...node,
  group: 'distribution',
  x: 2,
  y: index * 80 + 10,
}));

export const NODES: NetworkNode[] = [...suppliers, ...manufacturers, ...distribution];

export const LINKS: NetworkLink[] = [
  { source: 'supplier-a', target: 'plant-north', weight: 6.4, meta: { risk: 'low' } },
  { source: 'supplier-a', target: 'plant-central', weight: 4.8, meta: { risk: 'medium' } },
  { source: 'supplier-b', target: 'plant-central', weight: 5.6, meta: { risk: 'medium' } },
  { source: 'supplier-b', target: 'plant-south', weight: 4.1, meta: { risk: 'high' } },
  { source: 'supplier-c', target: 'plant-north', weight: 3.9, meta: { risk: 'low' } },
  { source: 'supplier-c', target: 'plant-south', weight: 3.3, meta: { risk: 'medium' } },
  { source: 'plant-north', target: 'dc-west', weight: 5.2, meta: { risk: 'low' } },
  { source: 'plant-north', target: 'dc-emea', weight: 3.5, meta: { risk: 'medium' } },
  { source: 'plant-central', target: 'dc-west', weight: 4.4, meta: { risk: 'medium' } },
  { source: 'plant-central', target: 'dc-east', weight: 5.9, meta: { risk: 'low' } },
  { source: 'plant-south', target: 'dc-east', weight: 4.7, meta: { risk: 'medium' } },
  { source: 'plant-south', target: 'dc-emea', weight: 3.8, meta: { risk: 'high' } },
];
```
