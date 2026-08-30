# Stepper

The Stepper component provides a step-by-step navigation interface, perfect for multi-step forms, wizards, and progress tracking.

## Metadata

- Canonical name: `Stepper`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Stepper } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: navigation
- Docs: https://react-ui-library.com/components/Stepper
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Stepper

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `active` | number | Yes |  | Active step index |
| `onStepClick` | (stepIndex: number) => void | No |  | Called when step is clicked |
| `orientation` | 'horizontal' \| 'vertical' | No |  | Step orientation |
| `iconPosition` | 'left' \| 'right' | No |  | Icon position relative to step body |
| `iconSize` | number | No |  | Icon size |
| `size` | ComponentSizeValue | No |  | Component size |
| `color` | string | No |  | Component color |
| `completedIcon` | ReactNode | No |  | Icon to display when step is completed |
| `allowNextStepsSelect` | boolean | No |  | Whether next steps (steps with higher index) can be selected |
| `children` | ReactNode | Yes |  | Step content |
| `ref` | React.Ref<HTMLDivElement> | No |  | Accessibility label Component reference |

## Examples

### Controlled Flow
ID: `Stepper.basic` • Tags: stepper • Category: usage • Status: stable • Since: 1.0.0

Control the active step with local state and show completion messaging once the flow finishes.

```tsx
const totalSteps = steps.length;
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
            Control the current step with the `active` prop and provide completion content with `Stepper.Completed`.
          </Text>
          <Stepper active={activeStep} onStepClick={handleStepChange}>
            {steps.map((step) => (
              <Stepper.Step key={step.label} label={step.label} description={step.description}>
                {step.details}
              </Stepper.Step>
            ))}
            <Stepper.Completed>
              All onboarding tasks are complete. You can continue to the dashboard.
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
```

### Visited Step Selection
ID: `Stepper.allowSelect` • Tags: stepper, selection • Category: behavior • Status: stable • Since: 1.0.0

Limit navigation to completed steps using `allowStepSelect`, while preserving forward progress through the flow.

```tsx
const totalSteps = steps.length;
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
```

### Icon Overrides
ID: `Stepper.customIcons` • Tags: stepper, icons • Category: appearance • Status: stable • Since: 1.0.0

Swap icons for both active steps and the completed state to reinforce the status of each milestone.

```tsx
const totalSteps = steps.length;
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
```

### Vertical Orientation
ID: `Stepper.vertical` • Tags: stepper, layout • Category: layout • Status: stable • Since: 1.0.0

Switch the orientation to vertical when you need more room for descriptive copy under each step.

```tsx
const totalSteps = steps.length;
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
        <Text size="sm" color="secondary">
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
```

### Loading Indicator
ID: `Stepper.loading` • Tags: stepper, feedback • Category: feedback • Status: stable • Since: 1.0.0

Replace the step icon with a spinner during long-running work by toggling the `loading` prop.

```tsx
const totalSteps = 3;
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
```

### Size Variants
ID: `Stepper.sizes` • Tags: stepper, sizing • Category: appearance • Status: stable • Since: 1.0.0

Compare the `size` prop across the full `xs`–`3xl` scale while reusing the same steps.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" color="secondary">{size}</Text>
          <Stepper active={1} size={size}>
            <Stepper.Step label="Plan" />
            <Stepper.Step label="Build" />
            <Stepper.Step label="Launch" />
          </Stepper>
        </Block>
      ))}
    </Block>
  );
}
```
