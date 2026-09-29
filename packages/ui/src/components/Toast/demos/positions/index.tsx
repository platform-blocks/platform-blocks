import { Button, Row, useToast } from '@platform-blocks/ui';

const toastPositions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export function Demo() {
  const toast = useToast();

  const showToastAtPosition = (position: typeof toastPositions[number]) => {
    toast.show({
      title: `Toast at ${position}`,
      message: `This toast appears at ${position} position.`,
      position,
    });
  };

  return (
    <Row gap="xs" wrap="wrap">
      {toastPositions.map((position) => (
        <Button key={position} size="sm" onPress={() => showToastAtPosition(position)}>
          {position}
        </Button>
      ))}
    </Row>
  );
}
