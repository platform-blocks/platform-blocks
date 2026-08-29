import { useState } from 'react';
import { Button, Card, Block, Row, Stepper, Text } from '@platform-blocks/ui';

import { onboardingSteps as steps } from '../data';

const totalSteps = steps.length;

export function Demo() {
  const [activeStep, setActiveStep] = useState(0);
  const [highestVisitedStep, setHighestVisitedStep] = useState(0);

  const handleStepChange = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex > totalSteps) {
      return;
    }

    setActiveStep(nextIndex);
    setHighestVisitedStep((previous) => Math.max(previous, Math.min(nextIndex, totalSteps - 1)));
  };

  const canSelectStep = (stepIndex: number) => highestVisitedStep >= stepIndex && activeStep !== stepIndex;

  const goPrevious = () => handleStepChange(activeStep - 1);
  const goNext = () => handleStepChange(activeStep + 1);

  return (
    <Block fullWidth>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Gate step selection with `allowStepSelect` so people can revisit completed steps without skipping ahead.
          </Text>
          <Stepper active={activeStep} onStepClick={handleStepChange}>
            {steps.map((step, index) => (
              <Stepper.Step
                key={step.label}
                label={step.label}
                description={step.description}
                allowStepSelect={canSelectStep(index)}
              >
                {step.details}
              </Stepper.Step>
            ))}
            <Stepper.Completed>
              Setup is complete. You can always return to earlier steps from the navigation.
            </Stepper.Completed>
          </Stepper>
          <Row gap="sm" justify="space-between">
            <Button variant="outline" onPress={goPrevious} disabled={activeStep === 0}>
              Back
            </Button>
            <Button onPress={goNext} disabled={activeStep === totalSteps}>
              {activeStep === totalSteps - 1 ? 'Finish' : 'Next step'}
            </Button>
          </Row>
        </Block>
      </Card>
    </Block>
  );
}
