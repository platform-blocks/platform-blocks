import { LineChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="Product engagement"
      subtitle="Scroll to zoom · drag to pan · Shift-drag to box-zoom · double-click to reset"
      height={340}
      series={SERIES}
      xAxis={{ show: true, title: 'Week', labelFormatter: (value) => `W${value}` }}
      yAxis={{ show: true, title: 'Count' }}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true }}
      enableCrosshair
      multiTooltip
      liveTooltip
      // Zoom & pan gestures (desktop web):
      enablePanZoom          // drag to pan (and gates wheel zoom)
      enableWheelZoom        // scroll wheel to zoom
      enableBrushZoom        // Shift + drag a box to zoom into it
      resetOnDoubleTap       // double-click to reset the view
      zoomMode="x"           // zoom the x-axis (time) only
      minZoom={0.15}
    />
  );
}
