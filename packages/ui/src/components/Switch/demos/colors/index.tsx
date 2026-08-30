import { Block, Row, Switch, Text } from '@platform-blocks/react-ui-library';

const COLOR_VARIANTS = [
  { label: 'Primary', color: 'primary' },
  { label: 'Secondary', color: 'secondary' },
  { label: 'Success', color: 'success' },
  { label: 'Warning', color: 'warning' },
  { label: 'Error', color: 'error' }
] as const;

export function Demo() {
  return (
    <Block>
      <Text variant="small" color="muted">
        Semantic color variants
      </Text>
      <Row gap="md" wrap="wrap">
        {COLOR_VARIANTS.map(({ label, color }) => (
          <Switch key={color} defaultChecked label={label} labelPosition="right" color={color} />
        ))}
      </Row>
    </Block>
  );
}


