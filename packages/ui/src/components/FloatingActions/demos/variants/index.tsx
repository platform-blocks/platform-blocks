import { Block, Column, FloatingActions, Text } from '@plocks/ui';

const actions = [{ key: 'add', icon: 'plus', label: 'Add item', onPress: () => {} }];
const variants = ['filled', 'default', 'outline', 'ghost'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <Block key={variant} position="relative" h={110} fullWidth p="sm">
          <Text fw="semibold">{variant}</Text>
          <FloatingActions variant={variant} actions={actions} />
        </Block>
      ))}
    </Column>
  );
}
