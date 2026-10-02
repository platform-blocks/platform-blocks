import { test, expect } from '@playwright/test';

// Run `npm run docs:visual:update` to review and update snapshots.

interface ChartBaseline {
  slug: string;
  fullId: string;
  filename: string;
  settleMs?: number;
}

interface ChartDemoPlan {
  id: string;
  filename?: string;
  settleMs?: number;
}

interface ChartBaselinePlan {
  slug: string;
  demos: ChartDemoPlan[];
}

const toKebabCase = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const chartBaselinePlans: ChartBaselinePlan[] = [
  {
    slug: 'AreaChart',
    demos: [
      { id: 'streaming-minutes-campaign', filename: 'area-chart-basic.png', settleMs: 800 },
      { id: 'renewable-energy-mix', filename: 'area-chart-renewable-energy-mix.png', settleMs: 800 },
    ],
  },
  {
    slug: 'BarChart',
    demos: [
      { id: 'basic', filename: 'bar-chart-basic.png' },
      { id: 'feature-adoption-by-tier', filename: 'bar-chart-feature-adoption.png' },
    ],
  },
  {
    slug: 'BubbleChart',
    demos: [{ id: 'basic', filename: 'bubble-chart-basic.png' }],
  },
  {
    slug: 'CandlestickChart',
    demos: [{ id: 'basic', filename: 'candlestick-chart-basic.png' }],
  },
  {
    slug: 'ComboChart',
    demos: [{ id: 'basic', filename: 'combo-chart-basic.png' }],
  },
  {
    slug: 'DonutChart',
    demos: [
      { id: 'basic', filename: 'donut-chart-basic.png' },
      { id: 'annual-expense-allocation', filename: 'donut-chart-annual-expense-allocation.png' },
    ],
  },
  {
    slug: 'FunnelChart',
    demos: [
      { id: 'basic', filename: 'funnel-chart-basic.png' },
      { id: 'data-pipeline-quality', filename: 'funnel-chart-data-pipeline-quality.png' },
    ],
  },
  {
    slug: 'GroupedBarChart',
    demos: [
      { id: 'basic', filename: 'grouped-bar-chart-basic.png' },
      { id: 'feature-usage-by-platform', filename: 'grouped-bar-chart-feature-usage.png' },
    ],
  },
  {
    slug: 'HeatmapChart',
    demos: [
      { id: 'basic', filename: 'heatmap-chart-basic.png' },
      { id: 'marketing-email-performance', filename: 'heatmap-chart-marketing-email-performance.png' },
    ],
  },
  {
    slug: 'HistogramChart',
    demos: [
      { id: 'basic', filename: 'histogram-chart-basic.png' },
      { id: 'contract-length-retention', filename: 'histogram-chart-contract-length.png' },
    ],
  },
  {
    slug: 'LineChart',
    demos: [
      { id: 'basic', filename: 'line-chart-basic.png', settleMs: 900 },
      { id: 'nps-trend-release-markers', filename: 'line-chart-nps-trend.png', settleMs: 900 },
    ],
  },
  {
    slug: 'NetworkChart',
    demos: [{ id: 'basic', filename: 'network-chart-basic.png' }],
  },
  {
    slug: 'PieChart',
    demos: [
      { id: 'basic', filename: 'pie-chart-basic.png' },
      { id: 'operating-expense-composition', filename: 'pie-chart-operating-expense.png' },
    ],
  },
  {
    slug: 'RadarChart',
    demos: [
      { id: 'basic', filename: 'radar-chart-basic.png' },
      { id: 'product-health', filename: 'radar-chart-product-health.png' },
    ],
  },
  {
    slug: 'RadialBarChart',
    demos: [{ id: 'basic', filename: 'radial-bar-chart-basic.png' }],
  },
  {
    slug: 'RidgeChart',
    demos: [
      { id: 'basic', filename: 'ridge-chart-basic.png' },
      { id: 'employee-satisfaction-survey', filename: 'ridge-chart-employee-satisfaction.png' },
    ],
  },
  {
    slug: 'SankeyChart',
    demos: [
      { id: 'basic', filename: 'sankey-chart-basic.png' },
      { id: 'customer-journey', filename: 'sankey-chart-customer-journey.png' },
    ],
  },
  {
    slug: 'ScatterChart',
    demos: [
      { id: 'basic', filename: 'scatter-chart-basic.png' },
      { id: 'campaign-spend-revenue', filename: 'scatter-chart-campaign-spend.png' },
    ],
  },
  {
    slug: 'SparklineChart',
    demos: [{ id: 'basic', filename: 'sparkline-basic.png' }],
  },
  {
    slug: 'StackedAreaChart',
    demos: [{ id: 'basic', filename: 'stacked-area-chart-basic.png' }],
  },
  {
    slug: 'StackedBarChart',
    demos: [{ id: 'basic', filename: 'stacked-bar-chart-basic.png' }],
  },
  {
    slug: 'ViolinChart',
    demos: [
      { id: 'basic', filename: 'violin-chart-basic.png' },
      { id: 'session-duration-by-platform', filename: 'violin-chart-session-duration.png' },
    ],
  },
];

const chartBaselines: ChartBaseline[] = chartBaselinePlans.flatMap((plan) =>
  plan.demos.map((demo) => {
    const fullId = demo.id.includes('.') ? demo.id : `${plan.slug}.${demo.id}`;
    const filename = demo.filename ?? `${toKebabCase(plan.slug)}-${demo.id}.png`;
    return { slug: plan.slug, fullId, filename, settleMs: demo.settleMs };
  })
);

test.describe('Chart baselines', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  for (const baseline of chartBaselines) {
    test(`captures ${baseline.fullId}`, async ({ page }) => {
      await page.goto(`/charts/${baseline.slug}`);
      await page.addStyleTag({ content: '[aria-label="Open actions"] { visibility: hidden !important; }' });

      // Examples are the first tab on every component detail page.
      await page.waitForLoadState('networkidle');
      const demoLocator = page.getByTestId(`demo-preview-${baseline.fullId}`).first();
      await demoLocator.waitFor({ state: 'visible' });
      await expect(demoLocator).toBeVisible();
      await demoLocator.scrollIntoViewIfNeeded();
      const settleDuration = baseline.settleMs ?? 600;
      await page.waitForTimeout(settleDuration);

      await expect(demoLocator).toHaveScreenshot(baseline.filename, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.005,
      });
    });
  }
});
