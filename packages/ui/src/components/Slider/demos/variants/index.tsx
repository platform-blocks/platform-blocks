import { Block, Slider } from '@plocks/ui';

const VARIANTS = ['default', 'filled', 'outline', 'minimal', 'segmented', 'unstyled'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Slider
          key={variant}
          label={variant}
          variant={variant}
          defaultValue={40}
          step={5}
          showTicks={variant === 'segmented'}
          restrictToTicks={variant === 'segmented'}
        />
      ))}
    </Block>
  );
}
