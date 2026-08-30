import { View, Platform } from 'react-native';
import React, { useState } from 'react';
import { Title } from '@platform-blocks/react-ui-library';
import { BarChart, LineChart, PieChart, ScatterChart, AreaChart, StackedAreaChart, CandlestickChart, RadarChart, HeatmapChart, FunnelChart, RadialBarChart, GaugeChart, SparklineChart, HistogramChart, ComboChart, GlobalChartsRoot, RidgeChart, ViolinChart, DonutChart, SankeyChart, NetworkChart } from '@platform-blocks/charts';

export function ChartShowcase() {
  const isWeb = Platform.OS === 'web';
  return (
    <GlobalChartsRoot config={{ multiTooltip: true, liveTooltip: true, enableCrosshair: true, popoverPortal: true, pointerPixelThreshold: 4, aggregatorMaxSeries: 5 }} style={{ position: 'relative' }}>
      <View>
        <BarChart
          title="Sample Bar Chart"
          data={[
            { category: 'A', value: 30, color: '#3b82f6' },
            { category: 'B', value: 20, color: '#f43f5e' },
            { category: 'C', value: 50, color: '#4ade80' },
          ]}
          xAxis={{ show: true, title: 'X Values' }}
          yAxis={{ show: true, title: 'Y Values' }}
          grid={{ show: true, showMajor: true }}
          onDataPointPress={(point) => console.log('Point pressed:', point)}
          useOwnInteractionProvider={false}
          suppressPopover
        />

        <EnhancedLineChartDemo />
        <EnhancedScatterChartDemo />
        <AreaChartDemo />
        <StackedAreaChartDemo />
        <CandlestickChartDemo />
        <RadarChartDemo />
        <HeatmapChartDemo />
        <FunnelChartDemo />
  <GaugeChartDemo />
        <RadialBarChartDemo />
        <SparklineChartDemo />
        <HistogramChartDemo />
        <PieChartDemo />
        <ComboChartDemo />
        <DonutChartDemo />
        <RidgeChartDemo />
        <ViolinChartDemo />
        <SankeyChartDemo />
        <NetworkChartDemo />

      </View>
    </GlobalChartsRoot>
  );
}

// Separate component to keep main layout clean.
function EnhancedLineChartDemo() {
  const [xDomain, setXDomain] = useState<[number, number] | null>(null);
  const [yDomain, setYDomain] = useState<[number, number] | null>(null);

  // Two series to showcase legend toggling & multi-tooltip
  const series = [
    {
      id: 's1',
      name: 'Series A',
      color: '#2563eb',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 25 },
        { x: 3, y: 15 },
        { x: 4, y: 40 },
        { x: 5, y: 35 },
        { x: 6, y: 50 },
        { x: 7, y: 42 },
        { x: 8, y: 58 },
      ],
      showPoints: true,
      pointSize: 5,
    },
    {
      id: 's2',
      name: 'Series B',
      color: '#f59e0b',
      data: [
        { x: 1, y: 14 },
        { x: 2, y: 18 },
        { x: 3, y: 22 },
        { x: 4, y: 28 },
        { x: 5, y: 31 },
        { x: 6, y: 37 },
        { x: 7, y: 45 },
        { x: 8, y: 49 },
      ],
      showPoints: true,
      pointSize: 5,
    },
  ];

  return (
    <LineChart
      invertPinchZoom={true}
      title="Interactive Line Chart"
      series={series}
      smooth
      fill
      enableCrosshair
      enableSeriesToggle
      enablePanZoom
      zoomMode="both"
      minZoom={0.1}
      enableWheelZoom
      wheelZoomStep={0.15}
      resetOnDoubleTap
      clampToInitialDomain
      onDomainChange={(xd, yd) => {
        setXDomain(xd);
        setYDomain(yd);
        // eslint-disable-next-line no-console
        console.log('Domain changed:', xd, yd);
      }}
      xAxis={{ show: true, title: 'X', showTicks: true, showLabels: true }}
      yAxis={{ show: true, title: 'Y', showTicks: true, showLabels: true }}
      grid={{ show: true, showMajor: true }}
      tooltip={{ show: true }}
      onDataPointPress={(pt) => {
        // eslint-disable-next-line no-console
        console.log('Point pressed', pt);
      }}
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
      style={{ marginTop: 12, marginBottom: 12 }}
    />
  );
}

function EnhancedScatterChartDemo() {
  const multiSeries = [
    {
      id: 'g1',
      name: 'Group 1',
      color: '#2563eb',
      data: [
        { id: 'g1-1', x: 10, y: 20 },
        { id: 'g1-2', x: 25, y: 35 },
        { id: 'g1-3', x: 40, y: 15 },
        { id: 'g1-4', x: 55, y: 45 },
      ],
    },
    {
      id: 'g2',
      name: 'Group 2',
      color: '#f59e0b',
      data: [
        { id: 'g2-1', x: 12, y: 28 },
        { id: 'g2-2', x: 30, y: 32 },
        { id: 'g2-3', x: 45, y: 22 },
        { id: 'g2-4', x: 60, y: 40 },
      ],
    },
  ];

  return (
    <ScatterChart
      title="Multi-Series Scatter"
      data={[]}
      series={multiSeries}
      showTrendline="per-series"
      enableCrosshair
      enablePanZoom
      enableWheelZoom
      zoomMode="both"
      minZoom={0.1}
      wheelZoomStep={0.15}
      resetOnDoubleTap
      clampToInitialDomain
      tooltip={{ show: true }}
      grid={{ show: true, showMajor: true }}
      xAxis={{ show: true, title: 'X', showLabels: true, showTicks: true }}
      yAxis={{ show: true, title: 'Y', showLabels: true, showTicks: true }}
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
      style={{ marginTop: 12, marginBottom: 12 }}
    />
  );
}

function AreaChartDemo() {
  const areaSeries = [
    { id: 'a1', name: 'Area A', color: '#3b82f6', data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: Math.sin(i / 2) * 20 + 40 })) },
    { id: 'a2', name: 'Area B', color: '#10b981', data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: Math.cos(i / 2) * 15 + 30 })) },
  ];
  return (
    <AreaChart
      title="Area Chart"
      series={areaSeries}
      smooth
      fill
      enableCrosshair
      enablePanZoom
      enableWheelZoom
      zoomMode="both"
      minZoom={0.1}
      wheelZoomStep={0.15}
      resetOnDoubleTap
      clampToInitialDomain
      yAxis={{ show: true, title: 'Value', showLabels: true, showTicks: true }}
      xAxis={{ show: true, title: 'Index', showLabels: true, showTicks: true }}
      grid={{ show: true, showMajor: true }}
      enableSeriesToggle
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
      style={{ marginTop: 12, marginBottom: 12 }}
    />
  );
}

function StackedAreaChartDemo() {
  const stackedSeries = [
    { id: 'sa1', name: 'Stack 1', color: '#6366f1', data: Array.from({ length: 15 }, (_, i) => ({ x: i, y: (Math.sin(i / 3) + 1) * 20 })) },
    { id: 'sa2', name: 'Stack 2', color: '#f59e0b', data: Array.from({ length: 15 }, (_, i) => ({ x: i, y: (Math.cos(i / 4) + 1) * 15 })) },
    { id: 'sa3', name: 'Stack 3', color: '#10b981', data: Array.from({ length: 15 }, (_, i) => ({ x: i, y: (Math.sin(i / 5) + 1) * 10 })) },
  ];
  return (
    <StackedAreaChart
      title="Stacked Area"
      series={stackedSeries}
      smooth
      enableCrosshair
      enablePanZoom
      enableWheelZoom
      zoomMode="both"
      minZoom={0.1}
      wheelZoomStep={0.15}
      resetOnDoubleTap
      clampToInitialDomain
      yAxis={{ show: true, title: 'Total', showLabels: true, showTicks: true }}
      xAxis={{ show: true, title: 'Index', showLabels: true, showTicks: true }}
      grid={{ show: true, showMajor: true }}
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
      style={{ marginTop: 12, marginBottom: 12 }}
    />
  );
}

// Simple synthetic OHLC data — generated once at module load so the Math.random
// calls stay out of the render path (react-hooks/purity forbids them there,
// even inside useMemo).
const CANDLESTICK_DATA = (() => {
  let lastClose = 50;
  return Array.from({ length: 40 }, (_, i) => {
    const open = lastClose;
    const change = (Math.random() - 0.5) * 4;
    const close = Math.max(10, open + change);
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    lastClose = close;
    return { x: i, open, high, low, close };
  });
})();

function CandlestickChartDemo() {
  const candles = CANDLESTICK_DATA;
  const candleSeries = [
    { id: 'cndl', name: 'Price', data: candles, colorBull: '#16a34a', colorBear: '#dc2626' },
    // Synthetic comparison series offset for legend toggle demo
    { id: 'cndl2', name: 'Price (Alt)', data: candles.map(c => ({ ...c, open: c.open * 1.02, close: c.close * 1.02, high: c.high * 1.02, low: c.low * 1.02 })), colorBull: '#0ea5e9', colorBear: '#ea580c' }
  ];
  return (
    <CandlestickChart
      title="Candlestick"
      series={candleSeries}
      movingAveragePeriods={[5, 10]}
      tooltip={{ show: false }}
      liveTooltip={false}
      multiTooltip={false}
      // showMovingAverages
      // enableCrosshair
      // enablePanZoom
      // enableWheelZoom
      zoomMode="x"
      minZoom={0.05}
      wheelZoomStep={0.2}
      resetOnDoubleTap
      clampToInitialDomain
      yAxis={{ show: true, title: 'Price', showLabels: true, showTicks: true }}
      xAxis={{ show: true, title: 'Index', showLabels: true, showTicks: true }}
      grid={{ show: true, showMajor: true }}
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
      style={{ marginTop: 12, marginBottom: 12 }}
    />
  );
}

function RadarChartDemo() {
  const radarSeries = [
    {
      id: 'r1', name: 'Alpha', color: '#2563eb', data: [
        { axis: 'Speed', value: 70 }, { axis: 'Power', value: 55 }, { axis: 'Agility', value: 80 }, { axis: 'Stamina', value: 65 }, { axis: 'IQ', value: 50 }
      ], showPoints: true
    },
    {
      id: 'r2', name: 'Beta', color: '#f59e0b', data: [
        { axis: 'Speed', value: 55 }, { axis: 'Power', value: 60 }, { axis: 'Agility', value: 50 }, { axis: 'Stamina', value: 78 }, { axis: 'IQ', value: 68 }
      ], showPoints: true
    }
  ];
  return (
    <RadarChart
      title="Radar"
      series={radarSeries}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      fill
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
      style={{ marginTop: 12, marginBottom: 12 }}
    />
  );
}

function HeatmapChartDemo() {
  const rows = Array.from({ length: 6 }, (_, i) => `R${i + 1}`);
  const cols = Array.from({ length: 8 }, (_, i) => `C${i + 1}`);
  const values = rows.map(() => cols.map(() => Math.round(Math.random() * 100)));
  return (
    <HeatmapChart
      title="Heatmap"
      data={{ rows, cols, values }}
      colorScale={{ type: 'linear' }}
      style={{ marginTop: 12, marginBottom: 12 }}
      useOwnInteractionProvider={false}
      suppressPopover
    />
  );
}

function FunnelChartDemo() {
  const funnel = {
    id: 'fn', name: 'Signup Funnel', steps: [
      { label: 'Visited', value: 1000 },
      { label: 'Signed Up', value: 620 },
      { label: 'Verified Email', value: 540 },
      { label: 'Onboarded', value: 420 },
      { label: 'Converted', value: 210 },
    ]
  };
  return (
    <FunnelChart
      title="Funnel"
      series={funnel}
      layout={{ shape: 'trapezoid', gap: 6, showConversion: true }}
      style={{ marginTop: 12, marginBottom: 24 }}
      useOwnInteractionProvider={false}
      suppressPopover
    />
  );
}

function PieChartDemo() {
  const pieData = [
    { label: 'Design', value: 26, color: '#6366f1' },
    { label: 'Development', value: 34, color: '#16a34a' },
    { label: 'Testing', value: 18, color: '#f59e0b' },
    { label: 'Research', value: 12, color: '#ef4444' },
    { label: 'Ops', value: 10, color: '#06b6d4' }
  ];

  return (
    <PieChart
      title="Team Allocation"
      data={pieData}
      width={320}
      height={260}
      showLabels
      showValues
      valueFormatter={(value, total) => `${Math.round((value / total) * 100)}%`}
      legend={{ show: true, position: 'bottom' }}
      animation={{ type: 'bounce', duration: 600, stagger: 90 }}
      tooltip={{ show: true, formatter: (slice) => `${slice.label}: ${slice.value}%` }}
      style={{ marginTop: 12, marginBottom: 24 }}
      useOwnInteractionProvider={false}
      suppressPopover
    />
  );
}

function GaugeChartDemo() {
  return (
    <GaugeChart
      title="Platform Health"
      subtitle="Real-time system load"
      width={320}
      height={240}
      value={68}
      min={0}
      max={100}
      thickness={16}
      track={{ opacity: 0.25 }}
      ranges={[
        { from: 0, to: 40, color: '#F87171', label: 'High' },
        { from: 40, to: 70, color: '#FBBF24', label: 'Watch' },
        { from: 70, to: 100, color: '#34D399', label: 'Optimal' },
      ]}
      ticks={{ major: 5, minor: 4, color: '#94A3B8' }}
      labels={{ formatter: (val) => `${Math.round(val)}%`, offset: 28 }}
      needle={{ length: 0.85, centerSize: 6, showCenter: true }}
      centerLabel={{ show: true, formatter: (val) => `${Math.round(val)}%`, secondaryText: (_, pct) => `${Math.round(pct * 100)}% of goal` }}
      legend={{ show: true, position: 'bottom' }}
    />
  );
}

function RadialBarChartDemo() {
  const radialData = [
    { id: 'cpu', label: 'CPU', value: 72, max: 100, color: '#6366f1' },
    { id: 'mem', label: 'Mem', value: 58, max: 100, color: '#f59e0b' },
    { id: 'net', label: 'Net', value: 34, max: 100, color: '#10b981' },
    { id: 'disk', label: 'Disk', value: 84, max: 100, color: '#ef4444' },
  ];
  return (
    <RadialBarChart
      title="Radial Bars"
      data={radialData}
      barThickness={14}
      gap={6}
      showValueLabels
      style={{ marginTop: 12, marginBottom: 12 }}
      legend={{ show: true, position: 'bottom' }}
      useOwnInteractionProvider={false}
      suppressPopover
    />
  );
}

// Small sparkline sequences — generated once at module load (see purity note above).
const SPARKLINE_A = Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i / 2) * 8 + (Math.random() - 0.5) * 4);
const SPARKLINE_B = Array.from({ length: 24 }, (_, i) => 30 + Math.cos(i / 3) * 6 + (Math.random() - 0.5) * 3);
const SPARKLINE_C = Array.from({ length: 24 }, (_, i) => 20 + (Math.sin(i / 4) + 1) * 5 + (Math.random() - 0.5) * 2);

function SparklineChartDemo() {
  const seriesA = SPARKLINE_A;
  const seriesB = SPARKLINE_B;
  const seriesC = SPARKLINE_C;
  const wrapperStyle = { flexDirection: 'row', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' } as any;
  const itemStyle = { backgroundColor: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8 };
  return (
    <View style={{ marginTop: 12, marginBottom: 24 }}>
      <Title>Sparklines</Title>
      <View style={wrapperStyle}>
        <View style={itemStyle}>
          <SparklineChart id="spark-a" name="A" data={seriesA} width={140} height={48} smooth fill highlightLast useOwnInteractionProvider={false} suppressPopover />
        </View>
        <View style={itemStyle}>
          <SparklineChart id="spark-b" name="B" data={seriesB} width={140} height={48} color="#f59e0b" smooth fill highlightLast useOwnInteractionProvider={false} suppressPopover />
        </View>
        <View style={itemStyle}>
          <SparklineChart id="spark-c" name="C" data={seriesC} width={140} height={48} color="#10b981" smooth fill highlightLast useOwnInteractionProvider={false} suppressPopover />
        </View>
      </View>
    </View>
  );
}

// Static demo data — generated once at module load so it stays out of the
// render path (react-hooks/purity forbids Math.random during render, even in useMemo).
const HISTOGRAM_VALUES = Array.from({ length: 600 }, () => (Math.random() * 0.8 + Math.random() * 0.2) * 100);

function HistogramChartDemo() {
  const values = HISTOGRAM_VALUES;
  return (
    <HistogramChart
      title="Histogram + Density"
      data={values}
      binMethod="fd"
      showDensity
      density
      barOpacity={0.55}
      densityColor="#dc2626"
      style={{ marginTop: 12, marginBottom: 24 }}
      useOwnInteractionProvider={false}
      suppressPopover
    />
  );
}

// Random portions generated once at module load (see purity note above); the
// sin/cos series are pure so they can stay inline.
const COMBO_BAR_DATA = Array.from({ length: 15 }, (_, i) => ({ x: i * 2, y: Math.random() * 40 + 10 }));
const COMBO_DENSITY_VALUES = Array.from({ length: 300 }, () => (Math.random() * 0.6 + Math.random() * 0.4) * 60);

function ComboChartDemo() {
  // Mixed synthetic data
  const lineData = Array.from({ length: 30 }, (_, i) => ({ x: i, y: Math.sin(i / 4) * 20 + 50 }));
  const areaData = Array.from({ length: 30 }, (_, i) => ({ x: i, y: Math.cos(i / 5) * 10 + 30 }));
  const barData = COMBO_BAR_DATA;
  const values = COMBO_DENSITY_VALUES;
  return (
    <View style={{ marginTop: 12, marginBottom: 24 }}>
      <Title>Combo (Bar + Line + Area + Density)</Title>
      <ComboChart
        width={620}
        height={320}
        layers={[
          { type: 'bar', data: barData, opacity: 0.5, name: 'Bars', color: '#6366f1' },
          { type: 'line', data: lineData, smooth: true, name: 'Line', color: '#dc2626', showPoints: true, pointSize: 4 },
          { type: 'area', data: areaData, smooth: true, name: 'Area', color: '#10b981', fillOpacity: 0.35 },
          { type: 'histogram', values, binMethod: 'sturges', name: 'Hist', color: '#f59e0b', opacity: 0.35 },
          { type: 'density', values, name: 'Density', color: '#f59e0b', thickness: 2 }
        ]}
        legend={{ show: true, position: 'bottom' }}
        useOwnInteractionProvider={false}
        suppressPopover
      />
    </View>
  );
}

function DonutChartDemo() {
  const data = [
    { label: 'Alpha', value: 30, color: '#6366f1' },
    { label: 'Beta', value: 20, color: '#f59e0b' },
    { label: 'Gamma', value: 25, color: '#10b981' },
    { label: 'Delta', value: 15, color: '#ef4444' }
  ];
  return (
    <DonutChart
      title="Donut"
      data={data}
      width={320}
      height={260}
      isolateOnClick
      centerLabel={(total) => `Total\n${total}`}
      animation={{ type: 'bounce' }}
      style={{ marginTop: 12, marginBottom: 24 }}
    />
  );
}

function RidgeChartDemo() {
  const series = Array.from({ length: 4 }, (_, i) => ({ id: `ridge-${i}`, name: `Group ${i + 1}`, values: Array.from({ length: 180 }, () => Math.random() * 50 + i * 5) }));
  return (
    <RidgeChart
      title="Ridge"
      series={series}
      width={640}
      height={320}
      samples={72}
      style={{ marginTop: 12, marginBottom: 24 }}
    />
  );
}

function ViolinChartDemo() {
  const series = Array.from({ length: 4 }, (_, i) => ({ id: `vio-${i}`, name: `Cat ${i + 1}`, values: Array.from({ length: 140 }, () => (Math.sin(Math.random() * Math.PI) + 1) * 25 + i * 3) }));
  return (
    <ViolinChart
      title="Violin"
      series={series}
      width={640}
      height={320}
      samples={72}
      style={{ marginTop: 12, marginBottom: 24 }}
    />
  );
}

function SankeyChartDemo() {
  const nodes = [
    { id: 'A', name: 'Source A' },
    { id: 'B', name: 'Source B' },
    { id: 'C', name: 'Mid C' },
    { id: 'D', name: 'Mid D' },
    { id: 'E', name: 'Sink E' },
    { id: 'F', name: 'Sink F' }
  ];
  const links = [
    { source: 'A', target: 'C', value: 30 },
    { source: 'A', target: 'D', value: 10 },
    { source: 'B', target: 'C', value: 15 },
    { source: 'B', target: 'D', value: 25 },
    { source: 'C', target: 'E', value: 28 },
    { source: 'C', target: 'F', value: 12 },
    { source: 'D', target: 'E', value: 20 },
    { source: 'D', target: 'F', value: 8 }
  ];
  return (
    <SankeyChart
      title="Sankey"
      nodes={nodes}
      links={links}
      width={680}
      height={360}
      style={{ marginTop: 12, marginBottom: 24 }}
    />
  );
}

// Nodes + random links generated once at module load (see purity note above).
const NETWORK_NODES = Array.from({ length: 14 }, (_, i) => ({ id: `N${i}`, name: `N${i}`, group: i % 4 }));
const NETWORK_LINKS = Array.from({ length: 24 }, () => {
  const a = Math.floor(Math.random() * NETWORK_NODES.length); let b = Math.floor(Math.random() * NETWORK_NODES.length); if (b === a) b = (b + 1) % NETWORK_NODES.length; return { source: NETWORK_NODES[a].id, target: NETWORK_NODES[b].id, weight: Math.random() * 3 + 1 };
});

function NetworkChartDemo() {
  const nodes = NETWORK_NODES;
  const links = NETWORK_LINKS;
  return (
    <NetworkChart
      title="Network"
      nodes={nodes}
      links={links}
      width={680}
      height={360}
      style={{ marginTop: 12, marginBottom: 24 }}
    />
  );
}