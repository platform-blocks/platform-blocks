# Funnel Chart

Shows progressive reduction of data through stages (conversion pipeline).

## Metadata

- Canonical name: `FunnelChart`
- Package: `@platform-blocks/charts`
- Import: `import { FunnelChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, funnel, conversion
- Docs: https://react-ui-library.com/components/FunnelChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/FunnelChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | FunnelChartSeries \| FunnelChartSeries[] | Yes |  | Funnel data series to render |
| `layout` | FunnelLayoutConfig | No |  | Layout customization options |
| `valueFormatter` | FunnelValueFormatter | No |  | Formatter for step values |
| `tooltip` | ChartTooltip<FunnelStep> | No |  | Tooltip configuration |
| `legend` | ChartLegend | No |  | Legend configuration |
| `enableCrosshair` | boolean | No | true | Enable crosshair indicator |
| `multiTooltip` | boolean | No | true | Enable aggregated tooltip for multiple series |
| `liveTooltip` | boolean | No | false | Keep tooltip following the pointer |
| `accessibilityTable` | FunnelAccessibilityTableOptions | No |  | Render hidden accessibility table |
| `onDataTable` | (payloads: FunnelDataTablePayload[]) => void | No |  | Callback invoked with data table payload |
| `width` | number | No | 360 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 420 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
ID: `FunnelChart.basic` • Category: charts

```tsx
const compact = (value: number) => {
	const abs = Math.abs(value);
	if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
	return `${value}`;
};
	return (
		<FunnelChart
			title="Product acquisition funnel"
			maxWidth={420}
			height={420}
			series={SALES_FUNNEL}
			layout={{
				shape: 'trapezoid',
				gap: 8,
				showConversion: false,
				align: 'center',
				connectors: { show: false },
			}}
			valueFormatter={(value) => compact(value)}
			legend={{ show: false }}
			tooltip={{
				show: true,
				formatter: (step) => `${step.label}: ${step.value.toLocaleString()}`,
			}}
		/>
	);
}
```

### Data Pipeline Quality
ID: `FunnelChart.data-pipeline-quality` • Category: charts

```tsx
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};
  return (
    <FunnelChart
      title="Data pipeline quality checks"
      subtitle="From ingestion to certified datasets"
      maxWidth={520}
      height={440}
      series={PIPELINE_QUALITY}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
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

### Ecommerce Checkout Payments
ID: `FunnelChart.ecommerce-checkout-payments` • Category: charts

```tsx
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};
const formatPaymentSplit = (split: CheckoutMeta['paymentSplit']) => {
  if (!split) return undefined;
  return `Payment mix: ${Math.round(split.stripe * 100)}% Stripe • ${Math.round(split.paypal * 100)}% PayPal • ${Math.round(split.bnpl * 100)}% BNPL`;
};
  return (
    <FunnelChart
      title="Ecommerce checkout conversion"
      subtitle="Drop-off by stage"
      maxWidth={520}
      height={440}
      series={CHECKOUT_FUNNEL}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
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

### Hiring Funnel Role Family
ID: `FunnelChart.hiring-funnel-role-family` • Category: charts

```tsx
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};
const findSeriesContext = (step: unknown) => STEP_LOOKUP.get(step as any) ?? null;
  return (
    <FunnelChart
      title="Hiring funnel — Staff engineer"
      subtitle="External candidates vs. internal transfers"
      maxWidth={620}
      height={480}
      series={HIRING_SERIES}
      layout={{
        shape: 'bar',
        gap: 10,
        align: 'center',
        showConversion: false,
        seriesMode: 'grouped',
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
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

### Incident Response Workflow
ID: `FunnelChart.incident-response-workflow` • Category: charts

```tsx
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};
  return (
    <FunnelChart
      title="Incident response workflow"
      subtitle="Volume flowing through each stage"
      maxWidth={520}
      height={460}
      series={INCIDENT_RESPONSE}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
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

### Saas Trial Conversion
ID: `FunnelChart.saas-trial-conversion` • Category: charts

```tsx
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};
  return (
    <FunnelChart
      title="SaaS trial-to-paid conversion"
      subtitle="Retention from sign-up to paid"
      maxWidth={520}
      height={440}
      series={TRIAL_CONVERSION}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => compact(value)}
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
