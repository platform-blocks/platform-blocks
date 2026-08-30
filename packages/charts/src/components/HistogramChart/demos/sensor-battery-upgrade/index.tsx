import { HistogramChart } from '@platform-blocks/charts';

import { BATTERY_VOLTAGES, REPLACEMENT_THRESHOLD, TARGET_VOLTAGE } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Sensor battery voltage after firmware upgrade"
      subtitle="Monitoring pack health across deployed field units"
      height={320}
      data={BATTERY_VOLTAGES}
      bins={12}
      binMethod="sturges"
      showDensity
      densityThickness={2.8}
      densityColor="#34D399"
      barOpacity={0.78}
      rangeHighlights={[
        { id: 'low-voltage', start: 3.0, end: REPLACEMENT_THRESHOLD, color: '#EF4444', opacity: 0.14 },
        { id: 'target-band', start: TARGET_VOLTAGE, end: 4.1, color: '#22C55E', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'replacement-line',
          shape: 'vertical-line',
          x: REPLACEMENT_THRESHOLD,
          color: '#DC2626',
          label: 'Replace below 3.5V',
        },
        {
          id: 'target-line',
          shape: 'vertical-line',
          x: TARGET_VOLTAGE,
          color: '#16A34A',
          label: 'Target 3.9V+',
        },
      ]}
      xAxis={{
        title: 'Voltage (V)',
        labelFormatter: (value) => `${value.toFixed(2)}V`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} sensors between ${bin.start.toFixed(2)}–${bin.end.toFixed(2)}V`,
      }}
      valueFormatter={(count, bin) => `${count} sensors · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
