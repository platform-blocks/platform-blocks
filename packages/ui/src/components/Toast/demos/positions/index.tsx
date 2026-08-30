import { Block, Button, Row, Text, useToast } from '@platform-blocks/react-ui-library';

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
    <Block>
      <Text size="xs" color="secondary">
        Pass `position` to align the toast container with your layout.
      </Text>
      <Row gap="xs" wrap="wrap">
        {toastPositions.map((position) => (
          <Button key={position} size="sm" onPress={() => showToastAtPosition(position)}>
            {position}
          </Button>
        ))}
      </Row>
    </Block>
  );
}


