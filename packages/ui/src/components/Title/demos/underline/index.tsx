import { Block, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title underline>Underline only</Title>
      <Title afterline>Afterline only</Title>
      <Title underline afterline>Underline with afterline</Title>
      <Title underline underlineColor="#ff4d4f" underlineStroke={4}>
        Custom underline color and stroke
      </Title>
    </Block>
  );
}
