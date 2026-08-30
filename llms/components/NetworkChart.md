# Network Chart

Graph structure visualization (nodes & links) for relationships.

### Highlights
- Force, coordinate, circular, or radial layouts with optional axis/grid controls.
- Scale node radius by value or custom accessor via `nodeRadiusRange` and `nodeValueAccessor`.
- Style links dynamically with `linkWidthRange`, curved or straight `linkShape`, palette fallbacks, and opacity/width accessors.
- Hook into `onNodeFocus` / `onLinkFocus` to drive tooltips or external panels without forking the component.

## Metadata

- Canonical name: `NetworkChart`
- Package: `@platform-blocks/charts`
- Import: `import { NetworkChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, network, graph
- Docs: https://react-ui-library.com/components/NetworkChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/NetworkChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `nodes` | NetworkNode[] | Yes |  | Nodes to render in the network |
| `links` | NetworkLink[] | Yes |  | Links connecting the nodes |
| `layout` | NetworkLayoutMode | No | 'force' | Layout engine mode |
| `grid` | ChartGrid \| boolean | No |  | Optional grid configuration for coordinate layouts |
| `xAxis` | ChartAxis | No |  | X axis configuration when using coordinate layouts |
| `yAxis` | ChartAxis | No |  | Y axis configuration when using coordinate layouts |
| `padding` | Partial<{ top: number; right: number; bottom: number; left: number }> | No |  | Optional padding overrides |
| `coordinateAccessor` | { x?: (node: NetworkNode, index: number) => number; y?: (node: NetworkNode, index: number) => number; } | No |  | Accessor overrides for coordinate layouts |
| `showLabels` | boolean | No | true | Show node labels |
| `nodeRadius` | number | No | 12 | Radius override for nodes |
| `nodeRadiusRange` | [number, number] | No |  | Optional range that scales node radius by node value |
| `nodeValueAccessor` | (node: NetworkNode, index: number) => number | No |  | Optional accessor to extract numeric value for node sizing |
| `linkWidthRange` | [number, number] | No |  | Optional range that maps link weights to stroke width |
| `linkColorAccessor` | (link: NetworkLink, index: number) => string \| undefined | No |  | Accessor for custom link colors |
| `linkOpacityAccessor` | (link: NetworkLink, index: number) => number \| undefined | No |  | Accessor for custom link opacity |
| `linkShape` | NetworkLinkShape | No |  | Link rendering shape |
| `linkCurveStrength` | number | No |  | Curvature strength multiplier when using curved links |
| `linkPalette` | string[] | No |  | Palette used when a link does not provide an explicit color |
| `onNodeFocus` | (event: NetworkNodeInteractionEvent) => void | No |  | Node focus callback for hover/focus interactions |
| `onNodeBlur` | (event: NetworkNodeInteractionEvent) => void | No |  | Node blur callback |
| `onNodePress` | (event: NetworkNodeInteractionEvent) => void | No |  | Node press callback |
| `onLinkFocus` | (event: NetworkLinkInteractionEvent) => void | No |  | Link focus callback for hover/focus interactions |
| `onLinkBlur` | (event: NetworkLinkInteractionEvent) => void | No |  | Link blur callback |
| `onLinkPress` | (event: NetworkLinkInteractionEvent) => void | No |  | Link press callback |
| `width` | number | No | 600 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 400 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
ID: `NetworkChart.basic` • Category: charts

```tsx
return (
		<NetworkChart
			title="Cross-team collaboration"
			height={420}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
```

### Customer Referral Network
ID: `NetworkChart.customer-referral-network` • Category: charts

```tsx
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
  return (
    <NetworkChart
      title="Customer referral influence network"
      subtitle="Referral pathways by activation wave"
      height={430}
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

### Knowledge Sharing Connections
ID: `NetworkChart.knowledge-sharing-connections` • Category: charts

```tsx
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
  const [focusDetail, setFocusDetail] = useState<string | null>(null);
  const highlightText = useMemo(() => focusDetail, [focusDetail]);
  return (
    <>
      <NetworkChart
        title="Knowledge sharing mentorship graph"
        subtitle="Monthly mentorship hours across guild programs"
        height={440}
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

### Microservice Latency
ID: `NetworkChart.microservice-latency` • Category: charts

```tsx
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
  return (
    <NetworkChart
      title="Microservice latency map"
      subtitle="Edge-to-core call graph with weighted latency"
      height={460}
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

### Risk Propagation
ID: `NetworkChart.risk-propagation` • Category: charts

```tsx
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
  return (
    <NetworkChart
      title="Risk propagation path"
      subtitle="Simulated attack progression across services"
      height={420}
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

### Supply Chain Relationships
ID: `NetworkChart.supply-chain-relationships` • Category: charts

```tsx
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
  return (
    <NetworkChart
      title="Supply chain relationship map"
      subtitle="Tiered flow from suppliers to regional distribution"
      height={440}
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
