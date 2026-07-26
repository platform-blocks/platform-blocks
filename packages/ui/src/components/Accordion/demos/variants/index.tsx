import { Accordion, Block, Text } from '@platform-blocks/ui';
import { onboardingSteps } from '../data';

const variants = ['default', 'separated', 'bordered'] as const;

export default function Demo() {
  return (
    <Block>
      {variants.map((variant) => (
        <Block key={variant}>
          <Text size="xs" weight="600" colorVariant="muted" uppercase tracking={1}>
            {variant}
          </Text>
          <Accordion type="single" variant={variant} items={onboardingSteps} />
        </Block>
      ))}
    </Block>
  );
}
