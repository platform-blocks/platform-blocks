import { Block, Divider, Text } from '@plocks/ui';

const OPACITIES = [1, 0.5, 0.25];

export function Demo() {
  return (
    <Block fullWidth>
      <Block fullWidth>
        <Text variant="small" c="secondary">gradient</Text>
        <Divider variant="gradient" color="primary" />
      </Block>
      {OPACITIES.map((opacity) => (
        <Block key={opacity} fullWidth>
          <Text variant="small" c="secondary">opacity {opacity}</Text>
          <Divider color="primary" opacity={opacity} />
        </Block>
      ))}
    </Block>
  );
}
