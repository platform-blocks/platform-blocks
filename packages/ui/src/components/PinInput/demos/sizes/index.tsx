import { Block, PinInput } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

export function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <PinInput key={size} size={size} label={size} />
      ))}
    </Block>
  );
}
