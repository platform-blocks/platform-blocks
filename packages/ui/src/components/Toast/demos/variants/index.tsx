import { Block, Button, Row, Text, useToast } from '@platform-blocks/ui';

export default function Demo() {
  const toast = useToast();

  const showSuccessToast = () => {
    toast.success({
      title: 'Success',
      message: 'The request completed correctly.',
    });
  };

  const showWarningToast = () => {
    toast.warning({
      title: 'Warning',
      message: 'Double-check the highlighted fields.',
    });
  };

  const showErrorToast = () => {
    toast.error({
      title: 'Error',
      message: 'Something went wrong.',
    });
  };

  const showInfoToast = () => {
    toast.info({
      title: 'Info',
      message: 'Here is some additional context.',
    });
  };

  return (
    <Block>
      <Text size="xs" colorVariant="secondary">
        Use the severity helpers to render consistent styling for each toast type.
      </Text>
      <Row gap="xs" wrap="wrap">
        <Button onPress={showSuccessToast} variant="filled" color="success">
          Success
        </Button>
        <Button onPress={showWarningToast} variant="filled" color="warning">
          Warning
        </Button>
        <Button onPress={showErrorToast} variant="filled" color="error">
          Error
        </Button>
        <Button onPress={showInfoToast} variant="outline">
          Info
        </Button>
      </Row>
    </Block>
  );
}


