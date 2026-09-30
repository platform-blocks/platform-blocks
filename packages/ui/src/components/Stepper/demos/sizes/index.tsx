import { Block, Stepper, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" c="secondary">{size}</Text>
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
