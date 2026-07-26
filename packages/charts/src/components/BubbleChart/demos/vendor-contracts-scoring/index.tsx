import { BubbleChart } from '../../';

import { Category, categoryPalette, contracts } from './data';

const formatSpend = (value: number) => `$${value.toFixed(1)}M`;

export default function Demo() {
  return (
    <BubbleChart
      title="Vendor Contract Health"
      subtitle="Compliance vs renewal probability — bubble area encodes annual spend"
      width={760}
      height={420}
      data={contracts}
      dataKey={{
        x: 'complianceScore',
        y: 'renewalProbability',
        z: 'annualSpendMillions',
        label: 'vendor',
        color: 'category',
        id: 'vendor',
      }}
      colorScale={(value) => (value && categoryPalette[value as Category]) || categoryPalette.Cloud}
      grid={{ show: true }}
      xAxis={{
        title: 'Compliance readiness score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Renewal probability %',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      valueFormatter={(value) => formatSpend(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Annual spend: ${formatSpend(value)}`,
          `Owner: ${record.owner} • Term ends: ${record.termEnds}`,
          `Risk: ${record.riskLevel}`,
        ].join('\n'),
      }}
      range={[72, 1620]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
