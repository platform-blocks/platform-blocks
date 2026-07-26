import { useState } from 'react';
import { Block, Checkbox, Text } from '@platform-blocks/ui';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'] as const;

export default function Demo() {
  const [values, setValues] = useState<Record<string, boolean>>({});

  const toggle = (color: string) => {
    setValues((current) => ({
      ...current,
      [color]: !current[color]
    }));
  };

  return (
    <Block>
      <Text weight="medium">Semantic colors</Text>
      <Block>
        {COLORS.map((color) => (
          <Checkbox
            key={color}
            colorVariant={color}
            label={`Color: ${color}`}
            checked={Boolean(values[color])}
            onChange={() => toggle(color)}
          />
        ))}
      </Block>
      <Checkbox
        colorVariant="success"
        label="Default checked"
        defaultChecked
      />
      <Text variant="small" colorVariant="muted">
        Use `colorVariant` to match checkbox accents with message intent while keeping labels readable.
      </Text>
    </Block>
  );
}
