import { Block, Button, Icon, Row, Text, Toast, useToast } from '@platform-blocks/react-ui-library';

const VARIANTS = ['light', 'filled', 'outline'] as const;

type ToastVariant = (typeof VARIANTS)[number];

const COPY: Record<ToastVariant, string> = {
  light: 'Subtle surface with a colored left accent.',
  filled: 'Solid fill with auto-contrast text.',
  outline: 'Surface with a full colored border.',
};

export function Demo() {
  const toast = useToast();

  return (
    <Block gap="md">
      <Text size="xs" color="secondary">
        The `variant` prop controls the toast surface. Each preview below pairs
        the variant with the `success` severity — swap `severity` or `color` to
        recolor any of them.
      </Text>

      {VARIANTS.map((variant) => (
        <Block key={variant} gap="xs">
          <Text variant="small" color="secondary">
            {variant}
          </Text>
          <Toast
            visible
            persistent
            autoHide={0}
            variant={variant}
            severity="success"
            title="Changes saved"
            icon={<Icon name="success" variant="filled" />}
            withCloseButton={false}
          >
            {COPY[variant]}
          </Toast>
        </Block>
      ))}

      <Row gap="xs" wrap="wrap">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            variant={variant === 'filled' ? 'filled' : 'outline'}
            onPress={() =>
              toast.success({
                variant,
                title: `${variant} toast`,
                message: COPY[variant],
              })
            }
          >
            Show {variant}
          </Button>
        ))}
      </Row>
    </Block>
  );
}
