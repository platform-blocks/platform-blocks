import { Block, Loader, Row, Text } from '@platform-blocks/ui';

// `speed` is the duration of one full animation cycle in milliseconds —
// lower is faster. Default is 1000ms.
const SPEEDS = [
  { label: 'Fast', value: 400 },
  { label: 'Default', value: 1000 },
  { label: 'Slow', value: 2000 },
];

export function Demo() {
  return (
    <Block>
      {SPEEDS.map(({ label, value }) => (
        <Row key={value} gap="lg" align="center">
          <Block minW={96}>
            <Text variant="small" weight="semibold">
              {label}
            </Text>
            <Text variant="small" color="muted">
              {value}ms
            </Text>
          </Block>
          <Loader variant="oval" size="lg" speed={value} />
          <Loader variant="bars" size="lg" speed={value} />
          <Loader variant="dots" size="lg" speed={value} />
        </Row>
      ))}
    </Block>
  );
}
