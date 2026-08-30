# Sankey Chart

Flow diagram showing volume between nodes.

## Metadata

- Canonical name: `SankeyChart`
- Package: `@platform-blocks/charts`
- Import: `import { SankeyChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, flow, sankey
- Docs: https://react-ui-library.com/components/SankeyChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/SankeyChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `nodes` | SankeyNode[] | Yes |  | Nodes included in the Sankey diagram |
| `links` | SankeyLink[] | Yes |  | Links connecting the nodes |
| `animationDuration` | number | No | 1000 | Animation duration in milliseconds |
| `disabled` | boolean | No | false | Disable animations |
| `nodeWidth` | number | No |  | Fixed node width in pixels (auto-calculated if omitted) |
| `nodePadding` | number | No |  | Vertical gap between nodes (auto-calculated if omitted) |
| `chartPadding` | Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>> | No |  | Override chart padding (defaults to 40px all around) |
| `labelFormatter` | (node: SankeyNode) => string | No |  | Format display label for a node |
| `valueFormatter` | (value: number, node: SankeyNode \| undefined) => string | No |  | Format value label for a node |
| `onNodeHover` | (node: SankeyNode \| null) => void | No |  | Receive callbacks when a node is hovered/focused |
| `onLinkHover` | (link: SankeyLink \| null) => void | No |  | Receive callbacks when a link is hovered/focused |
| `highlightOnHover` | boolean | No | true | Highlight hovered nodes/links (defaults to true) |
| `onDataInconsistency` | (issues: SankeyInconsistency[]) => void | No |  | Surfaced when inbound/outbound totals differ for a node |
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
| `animationEasing` | string | No |  | Animation easing function |
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
ID: `SankeyChart.basic` • Category: charts

```tsx
return (
		<SankeyChart
			title="Renewable energy flow"
			height={360}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
```

### Budget Allocation
ID: `SankeyChart.budget-allocation` • Category: charts

```tsx
return (
    <SankeyChart
      title="Budget allocation flow"
      subtitle="FY26 operating plan"
      height={400}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

### Cloud Provisioning
ID: `SankeyChart.cloud-provisioning` • Category: charts

```tsx
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

### Customer Journey
ID: `SankeyChart.customer-journey` • Category: charts

```tsx
return (
    <SankeyChart
      title="Customer journey flow"
      subtitle="Q3 acquisition to retention"
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

### Data Lineage
ID: `SankeyChart.data-lineage` • Category: charts

```tsx
return (
    <SankeyChart
      title="Analytics data lineage"
      subtitle="Daily load pipeline"
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```

### Talent Pipeline
ID: `SankeyChart.talent-pipeline` • Category: charts

```tsx
return (
    <SankeyChart
      title="Engineering talent pipeline"
      subtitle="Campus + lateral hiring"
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
```
