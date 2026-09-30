import { Gauge } from '@plocks/ui';

export function Demo() {
  return (
    <Gauge value={72} size={220} aria-label="Battery charge">
      <Gauge.Track />
      <Gauge.Range from={0} to={25} color="#ef4444" />
      <Gauge.Range from={25} to={100} color="#22c55e" />
      <Gauge.Ticks major={5} />
      <Gauge.Labels formatter={(value) => `${value}%`} />
      <Gauge.Needle config={{ shape: 'arrow' }} />
      <Gauge.Center />
    </Gauge>
  );
}
