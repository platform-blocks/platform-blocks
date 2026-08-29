import { DonutChart } from '@platform-blocks/charts';

import { POWER_BY_SUBSYSTEM } from './data';

const formatMegawatts = (value: number) => `${value.toFixed(1)} MW`;

export function Demo() {
  return (
    <DonutChart
      title="Data Center Power Draw"
      subtitle="May 2025 peak load"
      size={320}
      data={POWER_BY_SUBSYSTEM}
      padAngle={2}
      legend={{ position: 'right', align: 'start' }}
      padding={{ top: 140, right: 168, bottom: 72, left: 72 }}
      centerLabel={() => 'Power load'}
      centerSubLabel={() => 'Across campus subsystems'}
      centerValueFormatter={(value) => formatMegawatts(value)}
      labels={{
        show: true,
        position: 'outside',
        showPercentage: true,
        showValue: true,
        valueFormatter: ({ value }) => formatMegawatts(value),
        leaderLine: { width: 1.5 },
      }}
    />
  );
}
