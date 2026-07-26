import { ScatterChart } from '../../';

import { QUADRANTS, SERIES } from './data';

const describeQuadrant = (x: number, y: number) => {
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  const isRight = x >= QUADRANTS.x;
  const isTop = y >= QUADRANTS.y;

  if (isRight && isTop) return labels.topRight ?? null;
  if (!isRight && isTop) return labels.topLeft ?? null;
  if (isRight && !isTop) return labels.bottomRight ?? null;
  return labels.bottomLeft ?? null;
};

export default function Demo() {
  return (
    <ScatterChart
      title="API error rate vs. request volume"
      subtitle="Each point represents a service, sized by throughput"
      width={560}
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.9}
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xScaleType="log"
      xAxis={{
        show: true,
        title: 'Requests per minute (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      yAxis={{
        show: true,
        title: 'Error rate (%)',
        labelFormatter: (value: number) => `${value.toFixed(1)}%`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#12263A',
        textColor: '#F4F6FB',
        formatter: (point) => {
          const quadrantNote = describeQuadrant(point.x, point.y);
          const lines = [
            point.label ?? 'Service',
            `Volume ${Math.round(point.x)}k rpm · Errors ${point.y.toFixed(1)}%`,
          ];
          if (quadrantNote) {
            lines.push(quadrantNote);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
