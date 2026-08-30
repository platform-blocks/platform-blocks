import { CandlestickChart } from '@platform-blocks/charts';

import { COST_SERIES, CloudCandle, annotations } from './data';

export function Demo() {
  return (
    <CandlestickChart
      title="Cloud Spend Volatility"
      subtitle="Optimization window captured a 4.7% cost reduction"
      height={420}
      series={[
        {
          id: 'cloud-costs',
          name: 'Daily infrastructure cost',
          data: COST_SERIES,
          colorBull: '#10b981',
          colorBear: '#ef4444',
          wickColor: '#475569',
        },
      ]}
      movingAveragePeriods={[3, 5, 8]}
      movingAverageColors={['#38bdf8', '#6366f1', '#f97316']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.24}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const delta = candle.close - candle.open;
          const deltaLabel = `${delta >= 0 ? '+' : ''}$${delta.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          const note = (candle as CloudCandle).note ? `\n• ${ (candle as CloudCandle).note }` : '';
          return [
            `Start: $${candle.open.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            `End: $${candle.close.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${deltaLabel})`,
            `Compute hours: ${(candle.volume ?? 0).toLocaleString('en-US')}`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Billing day',
        labelFormatter: (value) => new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }}
      yAxis={{
        show: true,
        title: 'Daily cloud cost (USD)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      }}
      enableCrosshair
      liveTooltip
      xScaleType="time"
    />
  );
}
