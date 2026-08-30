import { BubbleChart } from '@platform-blocks/charts';

import { Region, cities, regionPalette } from './data';

const formatFootprint = (value: number) => `${value.toFixed(0)}k sq ft`;

export function Demo() {
  return (
    <BubbleChart
      title="Global Talent Hubs"
      subtitle="Talent depth vs cost of living — bubble size represents active office footprint"
      height={440}
      data={cities}
      dataKey={{
        x: 'costOfLivingIndex',
        y: 'talentDepth',
        z: 'officeFootprintKsqft',
        label: 'city',
        color: 'region',
        id: 'city',
      }}
      colorScale={(value) => (value && regionPalette[value as Region]) || regionPalette.Americas}
      grid={{ show: true }}
      xAxis={{
        title: 'Cost of living index (base 100 = SF)',
        labelFormatter: (value) => value.toFixed(0),
      }}
      yAxis={{
        title: 'Tech talent depth (0–100 readiness)',
        labelFormatter: (value) => value.toFixed(0),
      }}
      valueFormatter={(value) => formatFootprint(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Office footprint: ${formatFootprint(value)}`,
          `Remote ready: ${record.remoteReady}% • Avg tenure: ${record.averageTenure.toFixed(1)} yrs`,
          `Anchor university: ${record.anchorUniversity}`,
        ].join('\n'),
      }}
      range={[81, 1764]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
