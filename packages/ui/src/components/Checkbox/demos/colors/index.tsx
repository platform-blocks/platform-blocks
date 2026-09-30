import { Block, Checkbox } from '@plocks/ui';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'] as const;

export function Demo() {
  return (
    <Block>
      {COLORS.map((color) => (
        <Checkbox key={color} color={color} label={color} defaultChecked />
      ))}
    </Block>
  );
}
