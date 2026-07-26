import { CandlestickChart } from '../../';

import { MRR_SERIES, MrrCandle, annotations } from './data';

const formatMonth = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  year: 'numeric',
});

export default function Demo() {
  return (
    <CandlestickChart
      title="Subscription MRR Momentum"
      subtitle="Expansion revenue outpaced churn across a pricing refresh"
      width={720}
      height={420}
      series={[
        {
          id: 'mrr',
          name: 'Monthly recurring revenue',
          data: MRR_SERIES,
          colorBull: '#22c55e',
          colorBear: '#ef4444',
          wickColor: '#0f172a',
        },
      ]}
      movingAveragePeriods={[2, 3]}
      movingAverageColors={['#14b8a6', '#6366f1']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.22}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const net = candle.close - candle.open;
          const netLabel = `${net >= 0 ? '+' : '-'}$${Math.abs(net).toLocaleString('en-US')}`;
          const note = (candle as MrrCandle).note ? `\n• ${(candle as MrrCandle).note}` : '';
          return [
            `Open $${candle.open.toLocaleString('en-US')}`,
            `Close $${candle.close.toLocaleString('en-US')} (${netLabel})`,
            `Net expansions: ${(candle.volume ?? 0).toLocaleString('en-US')} accounts`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: formatMonth,
      }}
      yAxis={{
        show: true,
        title: 'MRR (USD)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US')}`,
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
