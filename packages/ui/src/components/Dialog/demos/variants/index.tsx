import { Button, Row, Text, useDialog } from '@plocks/ui';

const variants = ['modal', 'bottomsheet', 'fullscreen'] as const;

export function Demo() {
  const { openDialog } = useDialog();
  return (
    <Row gap="sm" wrap="wrap">
      {variants.map(variant => (
        <Button key={variant} variant="light" onPress={() => openDialog({
          variant,
          title: `${variant} dialog`,
          content: <Text>Dialog content in the {variant} presentation.</Text>,
        })}>
          Open {variant}
        </Button>
      ))}
    </Row>
  );
}
