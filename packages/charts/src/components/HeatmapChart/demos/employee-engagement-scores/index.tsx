import { HeatmapChart } from '@platform-blocks/charts';

import { DIMENSIONS, SCORES, TEAMS } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Employee engagement survey"
      subtitle="Dimension scores (1-5) by team"
      width={720}
      height={360}
      data={{ rows: TEAMS, cols: DIMENSIONS, values: SCORES }}
      cellSize={{ width: 96, height: 48 }}
      gap={4}
      colorScale={{
        min: 1,
        max: 5,
        stops: [
          { value: 2.5, color: '#F97316' },
          { value: 3.5, color: '#FACC15' },
          { value: 4.5, color: '#22C55E' },
        ],
      }}
      valueFormatter={({ value }) => `${value.toFixed(1)} score`}
      showCellLabels
      xAxis={{ show: true, title: 'Engagement dimension' }}
      yAxis={{ show: true, title: 'Team' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Needs focus (< 3.0)', color: '#F97316' },
          { label: 'Steady (3-4)', color: '#FACC15' },
          { label: 'High confidence (> 4)', color: '#22C55E' },
        ],
      }}
      cellCornerRadius={4}
      hoverHighlight={{ rowOpacity: 0.12, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: false }}
    />
  );
}
