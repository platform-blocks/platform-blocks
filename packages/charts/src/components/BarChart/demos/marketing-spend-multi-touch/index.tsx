import { BarChart } from '@platform-blocks/charts';

import { CAMPAIGN_SPEND, TOTAL_SPEND } from './data';

const formatSpend = (value: number) => `$${value.toLocaleString()}k`;

export function Demo() {
  return (
    <BarChart
      title="Marketing spend by channel"
      subtitle="Multi-touch journey campaign mix"
      width={720}
      height={420}
      data={CAMPAIGN_SPEND}
      barSpacing={0.28}
      legend={{ show: false }}
      valueFormatter={(value) => `${formatSpend(value)} invested`}
      valueLabel={{
        color: '#1f2937',
        fontSize: 12,
        offset: 12,
        formatter: (value) => {
          const share = TOTAL_SPEND ? (value / TOTAL_SPEND) * 100 : 0;
          return `${share.toFixed(1)}% of spend`;
        },
      }}
      yAxis={{
        show: true,
        title: 'Investment (USD thousands)',
        titleFontSize: 12,
        labelFormatter: (value) => `$${value.toFixed(0)}k`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const share = TOTAL_SPEND ? (datum.value / TOTAL_SPEND) * 100 : 0;
          return [
            datum.category,
            `Spend: ${formatSpend(datum.value)}`,
            `Share: ${share.toFixed(1)}% of program`,
            datum.data?.objective ? `Objective: ${datum.data.objective}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
