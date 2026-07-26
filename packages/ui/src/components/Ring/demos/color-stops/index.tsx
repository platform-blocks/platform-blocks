import { Ring, Row } from '@platform-blocks/ui';

const colorStops = [
  { value: 0, color: '#f87171' },
  { value: 60, color: '#f59e0b' },
  { value: 90, color: '#14b8a6' },
];

export default function Demo() {
  return (
    <Row gap="lg" justify="center" wrap="wrap">
      {[48, 72, 97].map((value) => (
        <Ring key={value} value={value} colorStops={colorStops} caption={`${value}%`} />
      ))}
    </Row>
  );
}
