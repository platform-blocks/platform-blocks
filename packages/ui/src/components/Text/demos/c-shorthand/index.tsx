import { Block, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Text weight="semibold">c (color shorthand)</Text>

      <Text c="dimmed">c="dimmed" — maps to theme.text.muted</Text>
      <Text c="primary">c="primary" — primary palette text shade</Text>
      <Text c="error">c="error" — error palette readable shade</Text>
      <Text c="success">c="success"</Text>

      <Text c="primary.5">c="primary.5" — explicit shade</Text>
      <Text c="error.7">c="error.7" — darker error</Text>

      <Text c="#a855f7">c="#a855f7" — raw CSS color</Text>

      <Text>
        Inline composition:{' '}
        <Text c="dimmed">subtle inline text</Text> next to{' '}
        <Text c="primary" weight="600">brand text</Text>.
      </Text>
    </Block>
  );
}
