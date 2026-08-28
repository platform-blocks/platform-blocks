import { ScatterChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export default function Demo() {
  return (
    <ScatterChart
      title="Spend vs. qualified leads"
      subtitle="Campaign cohort"
      width={520}
      height={340}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      showTrendline="per-series"
      enableCrosshair
      enablePanZoom
      zoomMode="both"
      multiTooltip
      liveTooltip
      xAxis={{
        show: true,
        title: 'Spend (USD thousands)',
        labelFormatter: (value) => `$${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Qualified leads',
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.x}k spend → ${point.y} leads`,
      }}
    />
  );
}
