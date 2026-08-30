# Radar Chart

Displays multivariate data across axes starting from the same origin.

## Metadata

- Canonical name: `RadarChart`
- Package: `@platform-blocks/charts`
- Import: `import { RadarChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, radar, polar
- Docs: https://react-ui-library.com/components/RadarChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/RadarChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | RadarChartSeries[] | Yes |  | Radar series to display |
| `maxValue` | number | No |  | Maximum value displayed across axes |
| `radialGrid` | RadarGridConfig | No |  | Grid styling configuration |
| `smooth` | boolean \| number | No |  | Smooth the polygon edges; pass a number between 0 and 1 to control tension |
| `fill` | boolean | No | true | Fill the radar area |
| `enableCrosshair` | boolean | No |  | Enable radial crosshair highlights |
| `multiTooltip` | boolean | No |  | Enable multi-series tooltip aggregation |
| `liveTooltip` | boolean | No |  | Follow pointer with tooltip |
| `legend` | ChartLegend | No |  | Legend configuration |
| `tooltip` | ChartTooltip<RadarAxisPoint> | No |  | Tooltip configuration |
| `width` | number | No | 400 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
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
| `animationDuration` | number | No | 800 | Animation duration in ms |
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

### Skill Comparison
ID: `RadarChart.skill-comparison` • Category: charts

Comparison of three engineering guilds with polygon grid, crosshair, and aggregated tooltip.

```tsx
return (
    <RadarChart
      title="Engineering guild comparison"
      subtitle="Quarterly capability radar"
      maxWidth={700}
      height={440}
      series={SERIES}
      maxValue={100}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      enableCrosshair
      multiTooltip
      liveTooltip
      legend={{ show: true, position: 'right', align: 'start' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${Math.round(point.value)}%`,
      }}
    />
  );
}
```

### Product Health
ID: `RadarChart.product-health` • Category: charts

Product health snapshot with circular grid, point markers, and custom tooltip messaging.

```tsx
return (
    <RadarChart
      title="Product health radar"
      subtitle="Operational score vs. strategic goal"
      maxWidth={580}
      height={440}
      series={SERIES}
      maxValue={10}
      radialGrid={{ rings: 4, shape: 'circle', showAxes: false }}
      enableCrosshair
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value.toFixed(1)} / 10`,
      }}
    />
  );
}
```

### Basic
ID: `RadarChart.basic` • Category: charts

```tsx
return (
    <RadarChart
      title="Team capability radar"
      maxWidth={560}
      height={380}
      series={SERIES}
      maxValue={60}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      smooth
      fill
      enableCrosshair
      multiTooltip
      liveTooltip
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value}`,
      }}
    />
  );
}
```

### Data Platform Maturity
ID: `RadarChart.data-platform-maturity` • Category: charts

```tsx
return (
    <RadarChart
      title="Data platform maturity"
      subtitle="Governance and enablement dimensions"
      maxWidth={620}
      height={480}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'bottom', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 24,
        ringLabels: [
          'Ad hoc',
          'Emerging',
          'Defined',
          'Managed',
          'Optimized',
        ],
        ringLabelPosition: 'outside',
        ringLabelOffset: 16,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 5`,
      }}
    />
  );
}
```

### Engineering Readiness
ID: `RadarChart.engineering-readiness` • Category: charts

```tsx
return (
    <RadarChart
      title="Engineering readiness radar"
      subtitle="Security, reliability, scalability, performance, maintainability"
      maxWidth={600}
      height={440}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      legend={{ show: true, position: 'bottom' }}
      radialGrid={{
        rings: 5,
        shape: 'circle',
        showAxes: true,
        axisLabelPlacement: 'outside',
        ringLabels: [
          'Reactive',
          'Developing',
          'Consistent',
          'Resilient',
          'Elite',
        ],
        ringLabelPosition: 'inside',
        ringLabelOffset: 18,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value.toFixed(1)} readiness`,
      }}
    />
  );
}
```

### Market Perception Interviews
ID: `RadarChart.market-perception-interviews` • Category: charts

```tsx
return (
    <RadarChart
      title="Market perception signal"
      subtitle="Customer interview scorecard"
      maxWidth={700}
      height={460}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'right', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 18,
        ringLabels: ({ index }) => ['Poor', 'Fair', 'Good', 'Great', 'Exceptional'][index],
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 5`,
      }}
    />
  );
}
```

### Product Capability Benchmark
ID: `RadarChart.product-capability-benchmark` • Category: charts

```tsx
return (
    <RadarChart
      title="Product capability vs. competition"
      subtitle="Benchmarking core differentiators"
      maxWidth={620}
      height={460}
      series={SERIES}
      maxValue={10}
      fill
      enableCrosshair
      legend={{ show: true, position: 'bottom', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        showAxes: true,
        axisLabelPlacement: 'outside',
        axisLabelOffset: 20,
        ringLabels: [
          'Baseline',
          'Market ready',
          'Parity',
          'Differentiated',
          'Category leader',
        ],
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 10`,
      }}
    />
  );
}
```

### Skills Gap Role Family
ID: `RadarChart.skills-gap-role-family` • Category: charts

```tsx
return (
    <RadarChart
      title="Role family skills gap analysis"
      subtitle="Percent attainment against competency targets"
      maxWidth={720}
      height={480}
      series={SERIES}
      maxValue={100}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'right', align: 'start' }}
      radialGrid={{
        rings: 4,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 24,
        ringLabels: ({ value }) => `${Math.round(value)} pts`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${Math.round(point.value)} / 100`,
      }}
    />
  );
}
```
