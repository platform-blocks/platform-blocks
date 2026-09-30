import { Block, Slider } from '@plocks/ui';

export function Demo() {
  return (
    <Block style={{ height: 200 }}>
      <Slider accessibilityLabel="Level" defaultValue={60} orientation="vertical" />
    </Block>
  );
}
