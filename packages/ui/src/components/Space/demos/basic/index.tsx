import { Block, Space, Text, useTheme } from '@platform-blocks/ui';

const EXAMPLES = [
  {
    label: 'Token spacing (md)',
    gap: 'md' as const,
    helper: 'Use theme tokens for consistent rhythm between related content.'
  },
  {
    label: 'Token spacing (xl)',
    gap: 'xl' as const,
    helper: 'Larger tokens create breathing room for grouped sections.'
  },
  {
    label: 'Numeric spacing (24px)',
    gap: 24,
    helper: 'Fallback to numeric values when a token does not fit the layout.'
  }
] as const;

export function Demo() {
  const theme = useTheme();

  return (
    <Block>
      {EXAMPLES.map(({ label, gap, helper }) => (
        <Block key={label}>
          <Text weight="medium">{label}</Text>
          <Block bg={theme.backgrounds.subtle} radius="lg" p="md">
            <Block>
              <Text>First line</Text>
              <Space h={gap} />
              <Text>Second line</Text>
            </Block>
          </Block>
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
