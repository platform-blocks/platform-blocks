import { CandlestickChart } from '@platform-blocks/charts';

import { PRICE_SERIES } from './data';

export function Demo() {
  return (
    <CandlestickChart
      title="AAPL daily candles"
      subtitle="Includes 3 & 5-day moving averages"
      height={360}
      series={[
        {
          id: 'apple',
          name: 'Apple Inc.',
          data: PRICE_SERIES,
          colorBull: '#34C38F',
          colorBear: '#F56565',
          wickColor: '#6B7280',
        },
      ]}
      movingAveragePeriods={[3, 5]}
      xAxis={{
        show: true,
        labelFormatter: (value) => new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        title: 'Trading day',
      }}
      yAxis={{
        show: true,
        title: 'Price (USD)',
        labelFormatter: (value) => `$${value.toFixed(0)}`,
      }}
      grid={{ show: true, color: '#E5EAF7' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) =>
          `O: $${candle.open.toFixed(2)} • H: $${candle.high.toFixed(2)} • L: $${candle.low.toFixed(2)} • C: $${candle.close.toFixed(2)}`,
      }}
      enableCrosshair
      liveTooltip
      animation={{ duration: 400 }}
      enablePanZoom
      zoomMode="both"
      minZoom={0.2}
      resetOnDoubleTap
      clampToInitialDomain
      xScaleType="time"
    />
  );
}
