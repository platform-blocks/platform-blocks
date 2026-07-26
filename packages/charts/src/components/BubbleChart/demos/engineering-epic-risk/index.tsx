import { BubbleChart } from '../../';

import { Squad, epics, squadPalette } from './data';

const formatMultiplier = (value: number) => `${value.toFixed(1)}× risk`;

export default function Demo() {
  return (
    <BubbleChart
      title="Epic Risk Landscape"
      subtitle="Story points vs defect density — bubble area communicates composite risk multiplier"
      width={760}
      height={420}
      data={epics}
      dataKey={{
        x: 'storyPoints',
        y: 'defectDensity',
        z: 'riskMultiplier',
        label: 'epic',
        color: 'squad',
        id: 'epic',
      }}
      colorScale={(value) => (value ? squadPalette[value as Squad] : squadPalette['Platform Reliability'])}
      grid={{ show: true }}
      xAxis={{
        title: 'Estimated effort (story points)',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Defect density (per 1000 lines)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      valueFormatter={(value) => formatMultiplier(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          formatMultiplier(value),
          `Critical paths: ${record.criticalPaths}`,
          `Squad: ${record.squad} • Phase: ${record.phase}`,
        ].join('\n'),
      }}
      range={[64, 1296]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
