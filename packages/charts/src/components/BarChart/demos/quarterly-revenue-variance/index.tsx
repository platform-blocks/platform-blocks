import { BarChart } from '../../';

import { REGIONAL_REVENUE } from './data';

const formatMillions = (value: number) => `$${value.toFixed(2)}M`;

const formatVariance = (value: number, datum: (typeof REGIONAL_REVENUE)[number]) => {
  const goal = datum.data?.goal ?? 0;
  const diff = value - goal;
  const direction = diff >= 0 ? '+' : '-';
  return `${direction}$${Math.abs(diff).toFixed(2)}M vs goal`;
};

export default function Demo() {
  return (
    <BarChart
      title="Quarterly Revenue by Region"
      subtitle="Q3 actuals with variance to plan"
      width={720}
      height={420}
      data={REGIONAL_REVENUE}
      barSpacing={0.32}
      legend={{ show: false }}
      valueFormatter={(value, datum) => {
        const goal = datum.data?.goal;
        return goal != null
          ? `${formatMillions(value)} actual (goal ${formatMillions(goal)})`
          : formatMillions(value);
      }}
      valueLabel={{
        formatter: (value, datum) => formatVariance(value, datum as (typeof REGIONAL_REVENUE)[number]),
        color: '#1f2937',
        fontSize: 12,
        fontWeight: '600',
        offset: 12,
      }}
      yAxis={{
        show: true,
        title: 'Revenue (USD millions)',
        titleFontSize: 12,
        labelFormatter: (value) => `$${value.toFixed(1)}M`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const goal = datum.data?.goal ?? 0;
          const diff = datum.value - goal;
          const pct = goal ? (diff / goal) * 100 : 0;
          const direction = diff >= 0 ? '+' : '-';
          const varianceValue = `${direction}${formatMillions(Math.abs(diff))}`;
          const variancePct = `${direction}${Math.abs(pct).toFixed(1)}%`;
          return [
            `${datum.category}`,
            `Actual: ${formatMillions(datum.value)}`,
            `Goal: ${formatMillions(goal)}`,
            `Variance: ${varianceValue} (${variancePct})`,
            datum.data?.focus ? `Focus: ${datum.data.focus}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
