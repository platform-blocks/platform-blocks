import { Block, Stepper, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" colorVariant="secondary">{size}</Text>
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
