import { Block, Icon, Text, Toast } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block gap="md">
      {SIZES.map((size) => (
        <Block key={size} gap="xs">
          <Text variant="small" c="secondary">
            {size}
          </Text>
          <Toast
            visible
            size={size}
            severity="info"
            title="Sync complete"
            icon={<Icon name="info" variant="filled" />}
            withCloseButton={false}
          >
            Everything is up to date.
          </Toast>
        </Block>
      ))}
    </Block>
  );
}
