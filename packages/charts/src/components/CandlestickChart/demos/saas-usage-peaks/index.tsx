import { CandlestickChart } from '@platform-blocks/charts';

import { USAGE_SERIES, UsageCandle, annotations } from './data';

const formatDay = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

export default function Demo() {
  return (
    <CandlestickChart
      title="SaaS Usage Peaks"
      subtitle="Daily active sessions during phased launch with capacity guardrails"
      width={700}
      height={420}
      series={[
        {
          id: 'active-sessions',
          name: 'Concurrent sessions',
          data: USAGE_SERIES,
          colorBull: '#22c55e',
          colorBear: '#ef4444',
          wickColor: '#0f172a',
        },
      ]}
      movingAveragePeriods={[3, 5]}
      movingAverageColors={['#0ea5e9', '#f97316']}
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
          const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toLocaleString('en-US')}`;
          const note = (candle as UsageCandle).note ? `\n• ${(candle as UsageCandle).note}` : '';
          return [
            `Start ${candle.open.toLocaleString('en-US')} sessions`,
            `End ${candle.close.toLocaleString('en-US')} (${deltaLabel})`,
            `Peak ${candle.high.toLocaleString('en-US')} • Floor ${candle.low.toLocaleString('en-US')}`,
            `Requests ${(candle.volume ?? 0).toLocaleString('en-US')}`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Day',
        labelFormatter: formatDay,
      }}
      yAxis={{
        show: true,
        title: 'Concurrent sessions',
        labelFormatter: (value) => value.toLocaleString('en-US'),
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
