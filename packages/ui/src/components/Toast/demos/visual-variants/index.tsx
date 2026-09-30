import { Block, Icon, Text, Toast } from '@plocks/ui';

const VARIANTS = ['light', 'filled', 'outline'] as const;

export function Demo() {
  return (
    <Block gap="md">
      {VARIANTS.map((variant) => (
        <Block key={variant} gap="xs">
          <Text variant="small" c="secondary">
            {variant}
          </Text>
          <Toast
            visible
            variant={variant}
            severity="success"
            title="Changes saved"
            icon={<Icon name="success" variant="filled" />}
            withCloseButton={false}
          >
            Your profile has been updated.
          </Toast>
        </Block>
      ))}
    </Block>
  );
}
