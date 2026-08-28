import { HeatmapChart } from '@platform-blocks/charts';

import { COLUMNS, CONTRIBUTION_MATRIX, PALETTE, WEEKDAY_LABELS } from './data';

export default function Demo() {
  return (
    <HeatmapChart
      title="Weekly contributions"
      subtitle="GitHub-style activity calendar"
      width={640}
      height={280}
      data={{ rows: WEEKDAY_LABELS, cols: COLUMNS, values: CONTRIBUTION_MATRIX }}
      cellSize={{ width: 12, height: 12 }}
      gap={2}
      colorScale={{ min: 0, max: 4, colors: PALETTE }}
      xAxis={{ show: false }}
      yAxis={{
        show: true,
        labelFormatter: (value) => WEEKDAY_LABELS[value] ?? '',
      }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Less', color: PALETTE[0] },
          { label: 'More', color: PALETTE[PALETTE.length - 1] },
        ],
      }}
      tooltip={{ show: true }}
    />
  );
}
