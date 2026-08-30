# Histogram Chart

Distribution of continuous data split into bins.

## Interaction highlights

- Emits `HistogramBinSummary` via `onBinFocus` / `onBinBlur` so external UI can react to the active bin.
- Pointer metadata now includes cumulative counts, density ratios, and percentile—ideal for shared popovers.

## Metadata

- Canonical name: `HistogramChart`
- Package: `@platform-blocks/charts`
- Import: `import { HistogramChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, histogram, distribution
- Docs: https://react-ui-library.com/components/HistogramChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/HistogramChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | number[] | Yes |  | Raw values used to build the histogram |
| `bins` | number | No |  | Explicit number of bins (overrides method) |
| `binMethod` | 'sturges' \| 'sqrt' \| 'fd' | No | 'sturges' | Bin selection heuristic |
| `showDensity` | boolean | No | true | Show density (KDE) overlay line |
| `bandwidth` | number | No |  | Gaussian kernel bandwidth (auto if not provided) |
| `density` | boolean | No | true | Normalize histogram to probability density (area=1) |
| `barColor` | string | No |  | Color for bars |
| `barOpacity` | number | No | 0.8 | Opacity for bars (0-1) |
| `densityColor` | string | No | '#ef4444' | Density line color |
| `densityThickness` | number | No | 2 | Density line thickness |
| `barRadius` | number | No | 2 | Rounded bar corners |
| `barGap` | number | No | 0.08 | Gap ratio between bars (0-1) |
| `multiTooltip` | boolean | No | true | Enable multi-series tooltip aggregation |
| `liveTooltip` | boolean | No | true | Keep tooltip following the pointer |
| `enableCrosshair` | boolean | No | true | Enable crosshair indicator |
| `tooltip` | ChartTooltip<HistogramBin> | No |  | Tooltip configuration |
| `valueFormatter` | (count: number, bin: HistogramBin) => string | No |  | Custom value formatter for tooltips |
| `xAxis` | ChartAxis | No |  | Customise X axis presentation |
| `yAxis` | ChartAxis | No |  | Customise Y axis presentation |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `legend` | ChartLegend | No |  | Legend configuration |
| `annotations` | ChartAnnotation[] | No |  | Render annotation markers (thresholds, targets) |
| `rangeHighlights` | Array<{ id: string \| number; start: number; end: number; color?: string; opacity?: number; }> | No |  | Highlight value ranges with background fills |
| `onBinFocus` | (bin: HistogramBinSummary) => void | No |  | Called whenever the active bin under the pointer changes |
| `onBinBlur` | (bin: HistogramBinSummary \| null) => void | No |  | Called when focus leaves the current bin |
| `width` | number | No | 400 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 260 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
| `onPress` | (event: ChartInteractionEvent<TData>) => void | No |  | Called when chart is tapped/clicked |
| `onDataPointPress` | (dataPoint: TData, event: ChartInteractionEvent<TData>) => void | No |  | Called when data point is selected |

## Examples

### Basic
ID: `HistogramChart.basic` • Category: charts

```tsx
return (
		<HistogramChart
			title="Session duration distribution"
			subtitle="Product analytics cohort"
			height={280}
			data={SESSION_DURATIONS}
			bins={10}
			showDensity
			densityThickness={3}
			densityColor="#12B886"
			barGap={0.15}
			tooltip={{
				show: true,
				formatter: (bin) => `${bin.count} sessions between ${bin.start}-${bin.end} min`,
			}}
			valueFormatter={(count, bin) => `${count} • ${bin.density.toFixed(2)} pdf`}
			enableCrosshair
			liveTooltip
		/>
	);
}
```

### Contract Length Retention
ID: `HistogramChart.contract-length-retention` • Category: charts

```tsx
return (
    <HistogramChart
      title="Customer contract length distribution"
      subtitle="Used to calibrate retention and renewal strategy"
      height={320}
      data={CONTRACT_LENGTHS}
      bins={12}
      binMethod="sturges"
      density={false}
      showDensity={false}
      barOpacity={0.82}
      rangeHighlights={[{ id: 'core-subscription', start: 12, end: 24, color: '#22C55E', opacity: 0.14 }]}
      annotations={[
        {
          id: 'one-year',
          shape: 'vertical-line',
          x: 12,
          color: '#22C55E',
          label: '1 year',
        },
        {
          id: 'two-year',
          shape: 'vertical-line',
          x: 24,
          color: '#15803D',
          label: '2 years',
        },
        {
          id: 'median',
          shape: 'vertical-line',
          x: median,
          color: '#F97316',
          label: `Median ${median} mo`,
        },
      ]}
      xAxis={{
        title: 'Contract length (months)',
      }}
      yAxis={{
        title: 'Customer accounts',
        labelFormatter: (value) => `${value.toFixed(0)}`,
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} accounts between ${bin.start.toFixed(0)}–${bin.end.toFixed(0)} months`,
      }}
      valueFormatter={(count) => `${count} customers`}
    />
  );
}
```

### Employee Tenure Distribution
ID: `HistogramChart.employee-tenure-distribution` • Category: charts

```tsx
return (
    <HistogramChart
      title="Employee tenure distribution"
      subtitle="Helps spot retention risks and succession depth"
      height={320}
      data={TENURE_YEARS}
      bins={12}
      binMethod="sqrt"
      showDensity
      densityThickness={2.5}
      densityColor="#22C55E"
      barOpacity={0.8}
      rangeHighlights={[
        { id: 'new-hires', start: 0, end: 1.5, color: '#FACC15', opacity: 0.18 },
        { id: 'veterans', start: 8, end: 15, color: '#22C55E', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'median-tenure',
          shape: 'vertical-line',
          x: Number(medianTenure.toFixed(2)),
          color: '#F97316',
          label: `Median ${medianTenure.toFixed(1)} yrs`,
        },
      ]}
      xAxis={{
        title: 'Tenure (years)',
        labelFormatter: (value) => `${value.toFixed(1)} yrs`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} teammates between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)} years`,
      }}
      valueFormatter={(count, bin) => `${count} people · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
```

### Page Load Performance
ID: `HistogramChart.page-load-performance` • Category: charts

```tsx
const [focusedBin, setFocusedBin] = useState<HistogramBinSummary | null>(null);
  return (
  <View>
      <HistogramChart
        title="Page load time distribution"
        subtitle="Week after performance optimization rollout"
        height={340}
        data={LOAD_TIMES}
        bins={14}
        binMethod="fd"
        showDensity
        densityThickness={3}
        barOpacity={0.78}
        densityColor="#12B886"
        rangeHighlights={[{ id: 'slo-window', start: 0, end: SLO_TARGET, color: '#38BDF8', opacity: 0.12 }]}
        annotations={[
          {
            id: 'slo-target',
            shape: 'vertical-line',
            x: SLO_TARGET,
            color: '#0EA5E9',
            label: 'SLO 2.5s',
          },
          {
            id: 'avg-load',
            shape: 'vertical-line',
            x: Number(AVERAGE_LOAD.toFixed(2)),
            color: '#F97316',
            label: `Avg ${AVERAGE_LOAD.toFixed(2)}s`,
          },
        ]}
        xAxis={{
          title: 'Page load time (seconds)',
          labelFormatter: (value) => `${value.toFixed(1)}s`,
        }}
        yAxis={{
          title: 'Probability density',
          labelFormatter: (value) => value.toFixed(2),
        }}
        grid={{ show: true }}
        tooltip={{
          show: true,
          formatter: (bin) => `${bin.count} page views between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)}s`,
        }}
        valueFormatter={(count, bin) => `${count} views · pdf ${bin.density.toFixed(3)}`}
        onBinFocus={(summary) => setFocusedBin(summary)}
        onBinBlur={() => setFocusedBin(null)}
      />
  <View style={{ paddingHorizontal: 4, marginTop: 12 }}>
        {focusedBin ? (
          <Text style={{ fontSize: 13, color: '#3F3F46' }}>
            {`${focusedBin.count} loads between ${focusedBin.start.toFixed(2)}–${focusedBin.end.toFixed(2)}s · percentile ${(focusedBin.percentile * 100).toFixed(1)}% · cumulative ${(focusedBin.cumulativeDensityRatio * 100).toFixed(1)}% density`}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: '#52525B' }}>
            Hover a bar to highlight its percentile and cumulative share of traffic.
          </Text>
        )}
      </View>
    </View>
  );
}
```

### Sensor Battery Upgrade
ID: `HistogramChart.sensor-battery-upgrade` • Category: charts

```tsx
return (
    <HistogramChart
      title="Sensor battery voltage after firmware upgrade"
      subtitle="Monitoring pack health across deployed field units"
      height={320}
      data={BATTERY_VOLTAGES}
      bins={12}
      binMethod="sturges"
      showDensity
      densityThickness={2.8}
      densityColor="#34D399"
      barOpacity={0.78}
      rangeHighlights={[
        { id: 'low-voltage', start: 3.0, end: REPLACEMENT_THRESHOLD, color: '#EF4444', opacity: 0.14 },
        { id: 'target-band', start: TARGET_VOLTAGE, end: 4.1, color: '#22C55E', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'replacement-line',
          shape: 'vertical-line',
          x: REPLACEMENT_THRESHOLD,
          color: '#DC2626',
          label: 'Replace below 3.5V',
        },
        {
          id: 'target-line',
          shape: 'vertical-line',
          x: TARGET_VOLTAGE,
          color: '#16A34A',
          label: 'Target 3.9V+',
        },
      ]}
      xAxis={{
        title: 'Voltage (V)',
        labelFormatter: (value) => `${value.toFixed(2)}V`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} sensors between ${bin.start.toFixed(2)}–${bin.end.toFixed(2)}V`,
      }}
      valueFormatter={(count, bin) => `${count} sensors · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
```

### Transaction Amount Fraud
ID: `HistogramChart.transaction-amount-fraud` • Category: charts

```tsx
return (
    <HistogramChart
      title="Transaction amount distribution"
      subtitle="Identifying anomalous high-value purchases"
      height={320}
      data={TRANSACTION_AMOUNTS}
      bins={16}
      binMethod="fd"
      showDensity
      barOpacity={0.76}
      densityColor="#0EA5E9"
      rangeHighlights={[
        { id: 'high-risk-window', start: 900, end: 1400, color: '#EF4444', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'manual-review',
          shape: 'vertical-line',
          x: REVIEW_THRESHOLD,
          color: '#DC2626',
          label: 'Manual review starts',
        },
      ]}
      xAxis={{
        title: 'Transaction amount (USD)',
        labelFormatter: (value) => `$${value.toFixed(0)}`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(3),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} orders between $${bin.start.toFixed(0)}–$${bin.end.toFixed(0)}`,
      }}
      valueFormatter={(count, bin) => `${count} orders · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
```
