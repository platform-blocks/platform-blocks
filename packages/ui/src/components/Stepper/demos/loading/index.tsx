import { useEffect, useRef, useState } from 'react';
import { Button, Card, Block, Row, Stepper, Text } from '@platform-blocks/ui';

const totalSteps = 3;

export function Demo() {
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStepChange = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= totalSteps) {
      return;
    }
    setActiveStep(nextIndex);
  };

  const simulateProcessing = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      handleStepChange(2);
    }, 2000);
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <Block fullWidth>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Apply the `loading` prop to a step when a background task is running to replace the icon with a spinner.
          </Text>
          <Stepper active={activeStep} onStepClick={handleStepChange}>
            <Stepper.Step label="Collect details" description="Complete form">
              Share your project information to kick off the workflow.
            </Stepper.Step>
            <Stepper.Step label="Processing" description="Sync data" loading={isLoading}>
              We are syncing your data and preparing the workspace.
            </Stepper.Step>
            <Stepper.Step label="Ready" description="Launch">
              Setup is complete and the workspace is ready for collaborators.
            </Stepper.Step>
          </Stepper>
          <Row justify="center">
            <Button onPress={simulateProcessing} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Simulate processing'}
            </Button>
          </Row>
        </Block>
      </Card>
    </Block>
  );
}
