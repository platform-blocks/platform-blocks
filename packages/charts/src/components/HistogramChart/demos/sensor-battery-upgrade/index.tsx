import { HistogramChart } from '@plocks/charts';

import { BATTERY_VOLTAGES, REPLACEMENT_THRESHOLD, TARGET_VOLTAGE } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Sensor battery voltage after firmware upgrade"
      subtitle="Diverging from the 3.9V target: red runs low, blue runs high"
      h={320}
      data={BATTERY_VOLTAGES}
      bins={12}
      binMethod="sturges"
      density={false}
      showDensity={false}
      barOpacity={0.9}
      colorScale={{
        type: 'diverging',
        midpoint: TARGET_VOLTAGE,
        colors: ['#e34948', '#2a78d6'],
      }}
      annotations={[
        {
          id: 'replacement-line',
          shape: 'vertical-line',
          x: REPLACEMENT_THRESHOLD,
          color: '#e34948',
          label: 'Replace below 3.5V',
        },
        {
          id: 'target-line',
          shape: 'vertical-line',
          x: TARGET_VOLTAGE,
          color: '#71717A',
          label: 'Target 3.9V',
        },
      ]}
      xAxis={{
        title: 'Voltage (V)',
        labelFormatter: (value) => `${value.toFixed(2)}V`,
      }}
      yAxis={{
        title: 'Sensors',
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} sensors between ${bin.start.toFixed(2)}–${bin.end.toFixed(2)}V`,
      }}
      valueFormatter={(count) => `${count} sensors`}
    />
  );
}
