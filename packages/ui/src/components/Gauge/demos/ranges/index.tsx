import { Gauge } from '@plocks/ui';

const ranges = [
  { from: 0, to: 40, color: '#3b82f6', label: 'Low' },
  { from: 40, to: 75, color: '#f59e0b', label: 'Elevated' },
  { from: 75, to: 100, color: '#ef4444', label: 'High' },
];

export function Demo() {
  return (
    <Gauge
      value={68}
      size={220}
      aria-label="System load"
      ranges={ranges}
      ticks={{ major: 5, minor: 4 }}
      labels={{ show: true }}
    />
  );
}
