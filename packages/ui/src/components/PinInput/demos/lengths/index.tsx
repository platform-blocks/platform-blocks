import { Block, PinInput } from '@plocks/ui';

const LENGTHS = [4, 6, 8];

export function Demo() {
  return (
    <Block>
      {LENGTHS.map((length) => (
        <PinInput key={length} length={length} label={`${length} digits`} />
      ))}
    </Block>
  );
}
