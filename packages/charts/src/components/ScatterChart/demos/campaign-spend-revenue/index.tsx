import { ScatterChart } from '../../';

import { QUADRANTS, SERIES } from './data';

const resolveAction = (x: number, y: number) => {
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  const right = x >= QUADRANTS.x;
  const top = y >= QUADRANTS.y;

  if (!right && top) return labels.topLeft ?? null;
  if (right && top) return labels.topRight ?? null;
  if (!right && !top) return labels.bottomLeft ?? null;
  return labels.bottomRight ?? null;
};

export default function Demo() {
  return (
    <ScatterChart
      title="Campaign spend vs. attributed revenue"
      subtitle="Ad set performance, each marker sized by budget grouping"
      width={560}
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.86}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Spend (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      yAxis={{
        show: true,
        title: 'Attributed revenue (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#0B1220',
        textColor: '#F1F5F9',
        formatter: (point) => {
          const action = resolveAction(point.x, point.y);
          const lines = [
            point.label ?? 'Ad set',
            `Spend $${point.x}k · Revenue $${point.y}k`,
          ];
          if (action) {
            lines.push(action);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
