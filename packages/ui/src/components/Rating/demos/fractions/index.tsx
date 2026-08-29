import { useState } from 'react';
import { Block, Rating, Text, useTheme } from '@platform-blocks/ui';

const FRACTION_SETTINGS = [
  {
    key: 'match',
    label: 'Match excitement',
    precision: 0.1,
    helper: 'Set scores in 0.1 increments to capture precise fan sentiment.'
  },
  {
    key: 'broadcast',
    label: 'Broadcast quality',
    precision: 0.5,
    helper: 'Use half-star increments when quick feedback is enough.'
  }
] as const;

type FractionKey = (typeof FRACTION_SETTINGS)[number]['key'];

export function Demo() {
  const theme = useTheme();
  const [values, setValues] = useState<Record<FractionKey, number>>({
    match: 4.2,
    broadcast: 3.5
  });

  return (
    <Block>
      {FRACTION_SETTINGS.map(({ key, label, precision, helper }) => (
        <Block key={key}>
          <Text variant="small" color="muted">
            {label}
          </Text>
          <Rating
            value={values[key]}
            onChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
            allowFraction
            precision={precision}
            size="lg"
            color={theme.colors.highlight[5]}
            emptyColor={theme.colors.highlight[1]}
            hoverColor={theme.colors.highlight[6]}
            showTooltip
          />
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}


