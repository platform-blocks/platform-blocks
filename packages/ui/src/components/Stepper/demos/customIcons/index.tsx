import { useState } from 'react';
import { Button, Card, Block, Icon, Row, Stepper, Text } from '@platform-blocks/ui';

import { onboardingSteps as steps } from '../data';

const totalSteps = steps.length;

export function Demo() {
  const [activeStep, setActiveStep] = useState(1);

  const handleStepChange = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex > totalSteps) {
      return;
    }
    setActiveStep(nextIndex);
  };

  const goPrevious = () => handleStepChange(activeStep - 1);
  const goNext = () => handleStepChange(activeStep + 1);

  return (
    <Block fullWidth>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Provide `icon` and `completedIcon` overrides to visually align each step with its stage.
          </Text>
          <Stepper
            active={activeStep}
            onStepClick={handleStepChange}
            completedIcon={<Icon name="check" size={18} color="white" />}
          >
            {steps.map((step) => (
              <Stepper.Step
                key={step.label}
                label={step.label}
                description={step.description}
                icon={<Icon name={step.icon} size={18} />}
              >
                {step.details}
              </Stepper.Step>
            ))}
            <Stepper.Completed>
              All setup tasks are complete with custom indicators for each stage.
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
