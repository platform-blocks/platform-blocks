import { Accordion, Block, Text } from '@platform-blocks/ui';
import { onboardingSteps } from '../data';

const variants = ['default', 'separated', 'bordered'] as const;

export function Demo() {
  return (
    <Block>
      {variants.map((variant) => (
        <Block key={variant}>
          <Text size="xs" fw="600" c="muted" tt="uppercase" lts={1}>
            {variant}
          </Text>
          <Accordion type="single" variant={variant} items={onboardingSteps} />
        </Block>
      ))}
    </Block>
  );
}
