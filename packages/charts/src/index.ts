// NOTE: This charts package lives outside ui/src rootDir; consuming tsconfigs must include this folder explicitly.
// Export order kept stable for tree-shaking predictability.

// Main chart components
export { BarChart } from './components/BarChart';
export { BubbleChart } from './components/BubbleChart';
export { PieChart } from './components/PieChart';
export { LineChart } from './components/LineChart';
export { ScatterChart } from './components/ScatterChart';
export { AreaChart } from './components/AreaChart';
export { StackedAreaChart } from './components/StackedAreaChart';
export { CandlestickChart } from './components/CandlestickChart';
export { RadarChart } from './components/RadarChart';
export { HeatmapChart } from './components/HeatmapChart';
export { FunnelChart } from './components/FunnelChart';
export { StackedBarChart } from './components/StackedBarChart';
export { GroupedBarChart } from './components/GroupedBarChart';
export { RadialBarChart } from './components/RadialBarChart';
export { GaugeChart } from './components/GaugeChart';
export { SparklineChart } from './components/SparklineChart';
export { HistogramChart } from './components/HistogramChart';
export { ComboChart } from './components/ComboChart';
export { RidgeChart } from './components/RidgeChart';
export { ViolinChart } from './components/ViolinChart';
export { SankeyChart } from './components/SankeyChart';
export { DonutChart } from './components/DonutChart';
export { NetworkChart } from './components/NetworkChart';
export { ParetoChart } from './components/ParetoChart';
export { MarimekkoChart } from './components/MarimekkoChart';

// Core chart building blocks and context
export { ChartRoot } from './core/ChartContext';
export { ChartContainer, ChartTitle, ChartLegend } from './ChartBase';
export { ChartsProvider, GlobalChartsRoot } from './ChartsProvider';
// New interaction engine (Phase 2)
export { ChartActiveTooltip } from './interaction/ChartActiveTooltip';
export { ChartGestureSurface } from './interaction/ChartGestureSurface';
export type { ChartGestureSurfaceProps } from './interaction/ChartGestureSurface';
export { useChartPointer } from './interaction/useChartPointer';
export type { UseChartPointerOptions, ChartPointerHandlers } from './interaction/useChartPointer';
export { useElementOffset } from './interaction/useElementOffset';
export { useOptionalChartInteraction } from './interaction/ChartInteractionContext';
export { normalizePointer } from './interaction/pointerNormalize';
export type {
  NormalizedPointerEvent,
  PointerPhase,
  PointerSource,
  PanGesture,
  PinchGesture,
  WheelGesture,
} from './interaction/pointerNormalize';
export { touchDistance, touchCenter, resolveGestureHandler } from './interaction/useOptionalPinch';
// Frame + hit-test engine (Phase 1)
export * from './core/frame';
export {
  createHitTester,
  PointSeriesHitTester,
  BandCategoryHitTester,
  CellGridHitTester,
  AngularSliceHitTester,
  RadarAxisHitTester,
} from './core/hittest';
export type {
  ChartRegistration,
  GeometrySpec,
  HitTester,
  HitQuery,
  ActiveTarget,
  TargetKind,
  Mark,
  MarkExtent,
  HitSeries,
} from './core/hittest';
export { ChartGrid } from './core/ChartGrid';
export { Axis } from './core/Axis';
export { ChartPlot, ChartLayer } from './core/ChartLayers';
export { ChartThemeProvider, useChartTheme } from './theme/ChartThemeContext';
export type { ChartTheme, HostThemeBridge } from './theme/ChartThemeContext';

// Hooks
export { useChartAnimation } from './hooks/useChartAnimation';
export { useChartData } from './hooks/useChartData';
export { useDataDecimation } from './hooks/useDataDecimation';
export { useDomains } from './hooks/useDomains';
export { usePanZoom } from './hooks/usePanZoom';
export { useStreamingData } from './hooks/useStreamingData';

// Utilities, scales, types
export * from './utils/scales';
export * from './utils/geometry';
export * from './types';
export * from './utils';
export * from './colors';
// Canonical tick generators live in ./utils/scales; disambiguate the duplicate
// names still present in ./utils (removed once all charts migrate off them).
export { generateLogTicks, generateTimeTicks } from './utils/scales';
