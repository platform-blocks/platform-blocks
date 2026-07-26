import { Block, Button, Icon, Row, Text, Toast, useToast } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  const toast = useToast();

  return (
    <Block gap="md">
      <Text size="xs" colorVariant="secondary">
        `size` accepts all seven component tokens. Padding, title and body type,
        the leading icon, and the close button all scale together — pass a
        number instead of a token to scale from a custom title size. The
        previews are static; the buttons below fire real toasts at each size.
      </Text>

      {SIZES.map((size) => (
        <Block key={size} gap="xs">
          <Text variant="small" colorVariant="secondary">
            {size}
          </Text>
          <Toast
            visible
            persistent
            autoHide={0}
            size={size}
            variant="light"
            sev="info"
            title="Sync complete"
            icon={<Icon name="info" variant="filled" />}
            withCloseButton={false}
          >
            Everything is up to date.
          </Toast>
        </Block>
      ))}

      <Row gap="xs" wrap="wrap">
        {SIZES.map((size) => (
          <Button
            key={size}
            size="sm"
            variant="outline"
            onPress={() =>
              toast.info({
                size,
                title: `Size ${size}`,
                message: 'Toasts keep their proportions at every token.',
              })
            }
          >
            {size}
          </Button>
        ))}
      </Row>
    </Block>
  );
}
