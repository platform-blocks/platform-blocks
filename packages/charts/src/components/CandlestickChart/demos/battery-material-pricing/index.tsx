import { CandlestickChart } from '@platform-blocks/charts';

import { LITHIUM_SERIES, NICKEL_SERIES, negotiationMarkers } from './data';

const formatWeek = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

export function Demo() {
  return (
    <CandlestickChart
      title="Battery Material Pricing"
      subtitle="Negotiation window tracked across lithium and nickel contracts"
      height={420}
      series={[
        {
          id: 'lithium',
          name: 'Lithium carbonate (USD/ton)',
          data: LITHIUM_SERIES,
          colorBull: '#0ea5e9',
          colorBear: '#bfdbfe',
          wickColor: '#1d4ed8',
        },
        {
          id: 'nickel',
          name: 'Nickel sulfate (USD/ton)',
          data: NICKEL_SERIES,
          colorBull: '#facc15',
          colorBear: '#fef08a',
          wickColor: '#ca8a04',
        },
      ]}
      movingAveragePeriods={[3]}
      movingAverageColors={['#6366f1']}
      annotations={negotiationMarkers}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => `Open $${candle.open.toLocaleString('en-US')} • Close $${candle.close.toLocaleString('en-US')} \nRange $${candle.low.toLocaleString('en-US')} – $${candle.high.toLocaleString('en-US')}`,
      }}
      xAxis={{
        show: true,
        title: 'Week of shipment',
        labelFormatter: formatWeek,
      }}
      yAxis={{
        show: true,
        title: 'Spot price (USD per metric ton)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US')}`,
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
