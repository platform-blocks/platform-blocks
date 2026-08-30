import { Block, Button, Row, Space, Text, useTheme } from '@platform-blocks/react-ui-library';

const GROUPS = [
  {
    label: 'Token spacing (lg)',
    gap: 'lg' as const,
    helper: 'Theme tokens keep button gutters aligned with the spacing scale.'
  },
  {
    label: 'Numeric spacing (18px)',
    gap: 18,
    helper: 'Use a numeric width when exact measurements are required.'
  }
] as const;

export function Demo() {
  const theme = useTheme();

  return (
    <Block>
      {GROUPS.map(({ label, gap, helper }) => (
        <Block key={label}>
          <Text weight="medium">{label}</Text>
          <Block bg={theme.backgrounds.surface} radius="lg" p="md">
            <Row align="center">
              <Button size="sm">Primary</Button>
              <Space w={gap} />
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Space w={gap} />
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
            </Row>
          </Block>
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
