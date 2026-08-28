import { ScatterChart } from '@platform-blocks/charts';

import { QUADRANTS, SERIES } from './data';

const resolveQuadrantLabel = (x: number, y: number) => {
  const horizontal = x >= QUADRANTS.x ? 'Right' : 'Left';
  const vertical = y >= QUADRANTS.y ? 'Top' : 'Bottom';
  const labels = QUADRANTS.labels;

  if (!labels) return null;
  if (horizontal === 'Left' && vertical === 'Top') return labels.topLeft ?? null;
  if (horizontal === 'Right' && vertical === 'Top') return labels.topRight ?? null;
  if (horizontal === 'Left' && vertical === 'Bottom') return labels.bottomLeft ?? null;
  if (horizontal === 'Right' && vertical === 'Bottom') return labels.bottomRight ?? null;
  return null;
};

export default function Demo() {
  return (
    <ScatterChart
      title="Customer LTV vs. Acquisition Cost"
      subtitle="Segment performance across recent cohorts"
      width={560}
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.9}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Acquisition cost (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      yAxis={{
        show: true,
        title: 'Lifetime value (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#101218',
        textColor: '#F8FAFC',
        formatter: (point) => {
          const quadrantLabel = resolveQuadrantLabel(point.x, point.y);
          const lines = [
            point.label ?? 'Segment',
            `CAC $${point.x}k · LTV $${point.y}k`,
          ];
          if (quadrantLabel) {
            lines.push(quadrantLabel);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
