import { GITHUB_REPO } from './urls';

export type ChartCategoryKey =
  | 'timeSeries'
  | 'comparison'
  | 'composition'
  | 'distribution'
  | 'relationship'
  | 'specialized';

export interface ChartCategoryMeta {
  key: ChartCategoryKey;
  label: string;
  description: string;
  icon: string;
}

export interface ChartResourceLink {
  label: string;
  href: string;
}

export interface ChartDocEntry {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  category: ChartCategoryKey;
  tags: string[];
  packageName?: string;
  demoIds?: string[];
  related?: string[];
  sourcePath: string;
  sourceUrl: string;
  resources?: ChartResourceLink[];
}

const SOURCE_BASE = `${GITHUB_REPO}/tree/main`;

export const CHART_CATEGORY_ORDER: ChartCategoryKey[] = [
  'timeSeries',
  'comparison',
  'composition',
  'distribution',
  'relationship',
  'specialized',
];

export const CHART_CATEGORIES: Record<ChartCategoryKey, ChartCategoryMeta> = {
  timeSeries: {
    key: 'timeSeries',
    label: 'Time series & trends',
    description: 'Charts that emphasise change over ordered dimensions like timestamps or sequences.',
    icon: 'chart-line',
  },
  comparison: {
    key: 'comparison',
    label: 'Comparisons',
    description: 'Compare categories or measure relationships between multiple quantitative series.',
    icon: 'chart-bar',
  },
  composition: {
    key: 'composition',
    label: 'Part-to-whole',
    description: 'Explain how individual segments contribute to a whole or how totals evolve.',
    icon: 'chart-donut',
  },
  distribution: {
    key: 'distribution',
    label: 'Distribution & density',
    description: 'Understand how values are distributed, clustered, or concentrated.',
    icon: 'chart-heatmap',
  },
  relationship: {
    key: 'relationship',
    label: 'Relationships & flow',
    description: 'Spot correlations, flows, and network relationships between variables.',
    icon: 'chart-scatter',
  },
  specialized: {
    key: 'specialized',
    label: 'Specialised & domain',
    description: 'Focused visualisations tailored to finance, funnels, or monitoring scenarios.',
    icon: 'filter',
  },
};

type RawChartDoc = Omit<ChartDocEntry, 'sourceUrl'>;

const RAW_CHART_DOCS: RawChartDoc[] = [
  {
    slug: 'LineChart',
    title: 'Line Chart',
    summary: 'Baseline cartesian chart for tracking change over ordered dimensions like time or sequence.',
    icon: 'chart-line',
    category: 'timeSeries',
    tags: ['trend', 'continuous', 'cartesian'],
    packageName: '@platform-blocks/charts',
    demoIds: ['LineChart.basic'],
    related: ['AreaChart', 'SparklineChart', 'ComboChart'],
    sourcePath: 'charts/src/components/LineChart',
    resources: [
      { label: 'Data Viz Catalogue – Line Graph', href: 'https://datavizcatalogue.com/methods/line_graph.html' },
    ],
  },
  {
    slug: 'AreaChart',
    title: 'Area Chart',
    summary: 'Filled variation of the line chart that emphasises cumulative magnitude under the curve.',
    icon: 'chart-area',
    category: 'timeSeries',
    tags: ['trend', 'filled', 'cumulative'],
    packageName: '@platform-blocks/charts',
    demoIds: ['AreaChart.basic'],
    related: ['LineChart', 'StackedAreaChart'],
    sourcePath: 'charts/src/components/AreaChart',
    resources: [
      { label: 'Data Viz Catalogue – Area Graph', href: 'https://datavizcatalogue.com/methods/area_graph.html' },
    ],
  },
  {
    slug: 'SparklineChart',
    title: 'Sparkline Chart',
    summary: 'Micro line visualization for inline trend monitoring inside dense UI layouts.',
    icon: 'chart-line',
    category: 'timeSeries',
    tags: ['micro', 'trend', 'inline'],
    packageName: '@platform-blocks/charts',
    related: ['LineChart'],
    sourcePath: 'charts/src/components/SparklineChart',
    resources: [
      { label: 'Edward Tufte – Sparklines', href: 'https://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0001OR' },
    ],
  },
  {
    slug: 'RidgeChart',
    title: 'Ridge Chart',
    summary: 'Ridgeline stacked density plots for comparing multiple distributions over a common axis.',
    icon: 'chart-area',
    category: 'distribution',
    tags: ['density', 'overlap', 'comparison'],
    packageName: '@platform-blocks/charts',
    related: ['ViolinChart', 'HeatmapChart'],
    sourcePath: 'charts/src/components/RidgeChart',
    resources: [
      { label: 'Data Viz Catalogue – Ridgeline Plot', href: 'https://datavizcatalogue.com/methods/ridgeline_plot.html' },
    ],
  },
  {
    slug: 'BarChart',
    title: 'Bar Chart',
    summary: 'Compare categorical values using proportional bar lengths with vertical or horizontal orientation.',
    icon: 'chart-bar',
    category: 'comparison',
    tags: ['categorical', 'comparison', 'baseline'],
    packageName: '@platform-blocks/charts',
    demoIds: ['BarChart.basic'],
    related: ['GroupedBarChart', 'StackedBarChart', 'ComboChart'],
    sourcePath: 'charts/src/components/BarChart',
    resources: [
      { label: 'Data Viz Catalogue – Bar Chart', href: 'https://datavizcatalogue.com/methods/bar_graph.html' },
    ],
  },
  {
    slug: 'GroupedBarChart',
    title: 'Grouped Bar Chart',
    summary: 'Cluster bars together to compare sub-categories side by side for each primary dimension.',
    icon: 'chart-bar',
    category: 'comparison',
    tags: ['categorical', 'grouped', 'multi-series'],
    packageName: '@platform-blocks/charts',
    demoIds: [
      'MarimekkoChart.basic',
      'MarimekkoChart.product-portfolio',
      'MarimekkoChart.regional-mix',
      'MarimekkoChart.budget-allocation',
    ],
    related: ['BarChart', 'StackedBarChart'],
    sourcePath: 'charts/src/components/GroupedBarChart',
    resources: [
      { label: 'Data Viz Catalogue – Grouped Bar Chart', href: 'https://datavizcatalogue.com/methods/grouped_bar_chart.html' },
    ],
  },
  {
    slug: 'StackedBarChart',
    title: 'Stacked Bar Chart',
    summary: 'Stack series in a single bar to show contributions to a cumulative total for each category.',
    icon: 'chart-bar',
    category: 'composition',
    tags: ['categorical', 'stacked', 'composition'],
    packageName: '@platform-blocks/charts',
    demoIds: [
      'ParetoChart.basic',
      'ParetoChart.customer-support-hotspots',
      'ParetoChart.revenue-concentration',
      'ParetoChart.incident-root-causes',
    ],
    related: ['BarChart', 'StackedAreaChart'],
    sourcePath: 'charts/src/components/StackedBarChart',
    resources: [
      { label: 'Data Viz Catalogue – Stacked Bar Chart', href: 'https://datavizcatalogue.com/methods/stacked_bar_chart.html' },
    ],
  },
  {
    slug: 'ComboChart',
    title: 'Combo Chart',
    summary: 'Blend bar and line series to compare magnitude and trend on dual or shared axes.',
    icon: 'chart-line',
    category: 'comparison',
    tags: ['hybrid', 'dual-axis', 'multi-series'],
    packageName: '@platform-blocks/charts',
    demoIds: ['ComboChart.basic'],
    related: ['BarChart', 'LineChart'],
    sourcePath: 'charts/src/components/ComboChart',
    resources: [
      { label: 'Excel – Combo Charts', href: 'https://support.microsoft.com/en-us/office/create-a-combo-chart-0b580b01-50a8-4e0d-90de-9db0b8a4ba0b' },
    ],
  },
  {
    slug: 'RadarChart',
    title: 'Radar Chart',
    summary: 'Plot multi-dimensional metrics along radial axes to highlight performance profiles.',
    icon: 'chart-line',
    category: 'comparison',
    tags: ['radial', 'spider', 'multi-metric'],
    packageName: '@platform-blocks/charts',
    related: ['GroupedBarChart', 'DonutChart'],
    sourcePath: 'charts/src/components/RadarChart',
    resources: [
      { label: 'Data Viz Catalogue – Radar Chart', href: 'https://datavizcatalogue.com/methods/radar_chart.html' },
    ],
  },
  {
    slug: 'PieChart',
    title: 'Pie Chart',
    summary: 'Slice a whole into proportional segments to emphasise composition at a glance.',
    icon: 'chart-pie',
    category: 'composition',
    tags: ['part-to-whole', 'segments', 'radial'],
    packageName: '@platform-blocks/charts',
    demoIds: ['PieChart.basic'],
    related: ['DonutChart', 'StackedBarChart'],
    sourcePath: 'charts/src/components/PieChart',
    resources: [
      { label: 'Data Viz Catalogue – Pie Chart', href: 'https://datavizcatalogue.com/methods/pie_chart.html' },
    ],
  },
  {
    slug: 'DonutChart',
    title: 'Donut Chart',
    summary: 'Ring-based variant of the pie chart with an empty centre for annotations or totals.',
    icon: 'chart-donut',
    category: 'composition',
    tags: ['part-to-whole', 'radial', 'donut'],
    packageName: '@platform-blocks/charts',
    demoIds: ['DonutChart.basic'],
    related: ['PieChart', 'RadialBarChart'],
    sourcePath: 'charts/src/components/DonutChart',
    resources: [
      { label: 'Data Viz Catalogue – Doughnut Chart', href: 'https://datavizcatalogue.com/methods/doughnut_chart.html' },
    ],
  },
  {
    slug: 'GaugeChart',
    title: 'Gauge Chart',
    summary: 'Radial dial for monitoring progress against bounded targets with contextual thresholds.',
    icon: 'speedometer',
    category: 'specialized',
    tags: ['radial', 'indicator', 'thresholds'],
    packageName: '@platform-blocks/charts',
    demoIds: ['GaugeChart.basic', 'GaugeChart.chromatic-audio-tuner'],
    related: ['DonutChart', 'RadialBarChart'],
    sourcePath: 'charts/src/components/GaugeChart',
    resources: [
      { label: 'Data Viz Catalogue – Gauge Chart', href: 'https://datavizcatalogue.com/methods/gauge_chart.html' },
    ],
  },
  {
    slug: 'RadialBarChart',
    title: 'Radial Bar Chart',
    summary: 'Wrap bar lengths around a circle to compare series using a polar layout.',
    icon: 'chart-donut',
    category: 'composition',
    tags: ['polar', 'comparison', 'circular'],
    packageName: '@platform-blocks/charts',
    related: ['DonutChart', 'RadarChart'],
    sourcePath: 'charts/src/components/RadialBarChart',
    resources: [
      { label: 'Data Viz Catalogue – Radial Bar Chart', href: 'https://datavizcatalogue.com/methods/radial_bar_chart.html' },
    ],
  },
  {
    slug: 'StackedAreaChart',
    title: 'Stacked Area Chart',
    summary: 'Layer multiple area series to show both overall totals and individual contributions over time.',
    icon: 'chart-area',
    category: 'composition',
    tags: ['stacked', 'trend', 'composition'],
    packageName: '@platform-blocks/charts',
    demoIds: ['StackedAreaChart.basic'],
    related: ['AreaChart', 'StackedBarChart'],
    sourcePath: 'charts/src/components/StackedAreaChart',
    resources: [
      { label: 'Data Viz Catalogue – Stream Graph', href: 'https://datavizcatalogue.com/methods/stream_graph.html' },
    ],
  },
  {
    slug: 'FunnelChart',
    title: 'Funnel Chart',
    summary: 'Depict progressive stages in a process, highlighting conversion or drop-off between steps.',
    icon: 'filter',
    category: 'composition',
    tags: ['conversion', 'pipeline', 'stages'],
    packageName: '@platform-blocks/charts',
    demoIds: ['FunnelChart.basic'],
    related: ['StackedBarChart'],
    sourcePath: 'charts/src/components/FunnelChart',
    resources: [
      { label: 'Data Viz Catalogue – Funnel Plot', href: 'https://datavizcatalogue.com/methods/funnel_plot.html' },
    ],
  },
  {
    slug: 'HistogramChart',
    title: 'Histogram',
    summary: 'Bin continuous values into buckets to inspect distributions, skew, and outliers.',
    icon: 'chart-bar',
    category: 'distribution',
    tags: ['distribution', 'frequency', 'bins'],
    packageName: '@platform-blocks/charts',
    demoIds: ['HistogramChart.basic'],
    related: ['HeatmapChart', 'ViolinChart'],
    sourcePath: 'charts/src/components/HistogramChart',
    resources: [
      { label: 'Data Viz Catalogue – Histogram', href: 'https://datavizcatalogue.com/methods/histogram.html' },
    ],
  },
  {
    slug: 'HeatmapChart',
    title: 'Heatmap',
    summary: 'Encode magnitude as colour intensity across a matrix of categories or time buckets.',
    icon: 'chart-heatmap',
    category: 'distribution',
    tags: ['matrix', 'density', 'intensity'],
    packageName: '@platform-blocks/charts',
    demoIds: ['HeatmapChart.basic'],
    related: ['HistogramChart', 'ScatterChart'],
    sourcePath: 'charts/src/components/HeatmapChart',
    resources: [
      { label: 'Data Viz Catalogue – Heatmap', href: 'https://datavizcatalogue.com/methods/heatmap.html' },
    ],
  },
  {
    slug: 'ViolinChart',
    title: 'Violin Chart',
    summary: 'Mirror kernel density plots to compare distributions and spot multi-modal behaviour.',
    icon: 'chart-area',
    category: 'distribution',
    tags: ['distribution', 'density', 'comparison'],
    packageName: '@platform-blocks/charts',
    related: ['HistogramChart', 'RidgeChart'],
    sourcePath: 'charts/src/components/ViolinChart',
    resources: [
      { label: 'Data Viz Catalogue – Violin Plot', href: 'https://datavizcatalogue.com/methods/violin_plot.html' },
    ],
  },
  {
    slug: 'ScatterChart',
    title: 'Scatter Plot',
    summary: 'Plot points by two continuous variables to detect relationships, clusters, or outliers.',
    icon: 'chart-scatter',
    category: 'relationship',
    tags: ['correlation', 'cartesian', 'bivariate'],
    packageName: '@platform-blocks/charts',
    demoIds: ['ScatterChart.basic'],
    related: ['BubbleChart', 'HeatmapChart'],
    sourcePath: 'charts/src/components/ScatterChart',
    resources: [
      { label: 'Data Viz Catalogue – Scatterplot', href: 'https://datavizcatalogue.com/methods/scatterplot.html' },
    ],
  },
  {
    slug: 'BubbleChart',
    title: 'Bubble Chart',
    summary: 'Extend scatter plots with a third variable encoded by marker size for richer comparisons.',
    icon: 'chart-scatter',
    category: 'relationship',
    tags: ['correlation', 'size-encoding', 'bivariate'],
    packageName: '@platform-blocks/charts',
    demoIds: ['BubbleChart.basic'],
    related: ['ScatterChart'],
    sourcePath: 'charts/src/components/BubbleChart',
    resources: [
      { label: 'Data Viz Catalogue – Bubble Chart', href: 'https://datavizcatalogue.com/methods/bubble_chart.html' },
    ],
  },
  {
    slug: 'NetworkChart',
    title: 'Network Chart',
    summary: 'Visualise nodes and edges to explain relationships, clusters, and connectivity.',
    icon: 'grid',
    category: 'relationship',
    tags: ['graph', 'nodes', 'edges'],
    packageName: '@platform-blocks/charts',
    demoIds: ['NetworkChart.basic'],
    related: ['SankeyChart'],
    sourcePath: 'charts/src/components/NetworkChart',
    resources: [
      { label: 'Data Viz Catalogue – Network Diagram', href: 'https://datavizcatalogue.com/methods/network_diagram.html' },
    ],
  },
  {
    slug: 'SankeyChart',
    title: 'Sankey Diagram',
    summary: 'Encode flow volume between categories using proportionally weighted links.',
    icon: 'grid',
    category: 'relationship',
    tags: ['flow', 'energy', 'hierarchy'],
    packageName: '@platform-blocks/charts',
    demoIds: ['SankeyChart.basic'],
    related: ['NetworkChart', 'FunnelChart'],
    sourcePath: 'charts/src/components/SankeyChart',
    resources: [
      { label: 'Data Viz Catalogue – Sankey Diagram', href: 'https://datavizcatalogue.com/methods/sankey_diagram.html' },
    ],
  },
  {
    slug: 'CandlestickChart',
    title: 'Candlestick Chart',
    summary: 'Financial OHLC visualisation highlighting open, high, low, and close for trading periods.',
    icon: 'chart-line',
    category: 'specialized',
    tags: ['financial', 'ohlc', 'volatility'],
    packageName: '@platform-blocks/charts',
    demoIds: ['CandlestickChart.basic'],
    related: ['LineChart'],
    sourcePath: 'charts/src/components/CandlestickChart',
    resources: [
      { label: 'Investopedia – Candlestick Charting Basics', href: 'https://www.investopedia.com/trading/candlestick-charting-what-is-it/' },
    ],
  },
  {
    slug: 'MarimekkoChart',
    title: 'Marimekko Chart',
    summary: 'Two-dimensional stacked chart for visualising categorical data across dual axes.',
    icon: 'chart-bar',
    category: 'composition',
    tags: ['categorical', 'stacked', 'dual-axis'],
    packageName: '@platform-blocks/charts',
    demoIds: ['MarimekkoChart.basic'],
    related: ['StackedBarChart', 'GroupedBarChart'],  
    sourcePath: 'charts/src/components/MarimekkoChart',
    resources: [
      { label: 'Data Viz Catalogue – Marimekko Chart', href: 'https://datavizcatalogue.com/methods/marimekko_chart.html' },
    ],
  },
  {
    slug: 'ParetoChart',
    title: 'Pareto Chart',
    summary: 'Combination of bars and a line to highlight the most significant factors in a dataset.',
    icon: 'chart-bar',
    category: 'comparison',
    tags: ['categorical', 'cumulative', 'dual-axis'],
    packageName: '@platform-blocks/charts',
    demoIds: ['ParetoChart.basic'],
    related: ['BarChart', 'ComboChart'],  
    sourcePath: 'charts/src/components/ParetoChart',
    resources: [
      { label: 'Data Viz Catalogue – Pareto Chart', href: 'https://datavizcatalogue.com/methods/pareto_chart.html' },
    ],  
  }
];

export const CHART_DOCS: ChartDocEntry[] = RAW_CHART_DOCS.map((entry) => ({
  ...entry,
  sourceUrl: `${SOURCE_BASE}/${entry.sourcePath}`,
}));

export const CHART_DOC_MAP: Record<string, ChartDocEntry> = CHART_DOCS.reduce((acc, chart) => {
  acc[chart.slug] = chart;
  return acc;
}, {} as Record<string, ChartDocEntry>);

export function getChartDoc(slug: string | null | undefined): ChartDocEntry | undefined {
  if (!slug) return undefined;
  return CHART_DOC_MAP[slug] || undefined;
}

export function getChartsByCategory(): Record<ChartCategoryKey, ChartDocEntry[]> {
  return CHART_CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = CHART_DOCS.filter((chart) => chart.category === category);
    return acc;
  }, {} as Record<ChartCategoryKey, ChartDocEntry[]>);
}

export function getAllChartDocs(): ChartDocEntry[] {
  return [...CHART_DOCS];
}

export function getRelatedCharts(slug: string): ChartDocEntry[] {
  const chart = getChartDoc(slug);
  if (!chart?.related?.length) return [];
  return chart.related
    .map((relatedSlug) => getChartDoc(relatedSlug))
    .filter((item): item is ChartDocEntry => Boolean(item));
}
