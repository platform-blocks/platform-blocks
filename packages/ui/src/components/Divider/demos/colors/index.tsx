import { Block, Divider, Text } from '@plocks/ui';

const COLORS = ['border', 'subtle', 'muted', 'gray', 'primary', 'secondary', 'success', 'warning', 'error'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {COLORS.map((color) => (
        <Block key={color} fullWidth>
          <Text variant="small" c="secondary">{color}</Text>
          <Divider color={color} />
        </Block>
      ))}
    </Block>
  );
}
