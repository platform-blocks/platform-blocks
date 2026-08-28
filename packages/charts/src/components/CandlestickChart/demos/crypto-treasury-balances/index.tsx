import { CandlestickChart } from '@platform-blocks/charts';

import { TREASURY_SERIES, TreasuryCandle, annotations } from './data';

const formatWeek = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

export default function Demo() {
  return (
    <CandlestickChart
      title="Crypto Treasury Balances"
      subtitle="Weekly BTC position changes with treasury policy markers"
      width={720}
      height={420}
      series={[
        {
          id: 'btc',
          name: 'BTC holdings (USD equivalent)',
          data: TREASURY_SERIES,
          colorBull: '#0ea5e9',
          colorBear: '#f97316',
          wickColor: '#1f2937',
        },
      ]}
      movingAveragePeriods={[2, 4, 6]}
      movingAverageColors={['#38bdf8', '#6366f1', '#facc15']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.2}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const delta = candle.close - candle.open;
          const deltaLabel = `${delta >= 0 ? '+' : '-'}$${Math.abs(delta).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          const note = (candle as TreasuryCandle).note ? `\n• ${(candle as TreasuryCandle).note}` : '';
          return [
            `Open $${candle.open.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            `Close $${candle.close.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${deltaLabel})`,
            `Flow: ${(candle.volume ?? 0).toLocaleString('en-US')} BTC`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Week of',
        labelFormatter: formatWeek,
      }}
      yAxis={{
        show: true,
        title: 'USD value (thousands)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US')}`,
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
