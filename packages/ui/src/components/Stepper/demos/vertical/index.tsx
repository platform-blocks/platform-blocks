import { useState } from 'react';
import { Block, Button, Card, Row, Stepper, Text } from '@platform-blocks/ui';

import { onboardingSteps as steps } from '../data';

const totalSteps = steps.length;

export default function Demo() {
  const [activeStep, setActiveStep] = useState(1);

  const handleStepChange = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= totalSteps) {
      return;
    }
    setActiveStep(nextIndex);
  };

  const goPrevious = () => handleStepChange(activeStep - 1);
  const goNext = () => handleStepChange(activeStep + 1);

  return (
    <Card p="md">
      <Block>
        <Text size="sm" colorVariant="secondary">
          Switch to `orientation="vertical"` when steps need additional room for supporting copy.
        </Text>
        <Stepper active={activeStep} onStepClick={handleStepChange} orientation="vertical">
          {steps.map((step, index) => (
            <Stepper.Step key={step.label} label={step.label} description={step.description}>
              {step.details}
            </Stepper.Step>
          ))}
        </Stepper>
        <Row gap="sm" justify="space-between">
          <Button variant="outline" onPress={goPrevious} disabled={activeStep === 0}>
            Back
          </Button>
          <Button onPress={goNext} disabled={activeStep === totalSteps - 1}>
            Next step
          </Button>
        </Row>
      </Block>
    </Card>
  );
}
