import { useState } from 'react';
import { Block, Checkbox, Text } from '@platform-blocks/ui';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'error'] as const;

export function Demo() {
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
            color={color}
            label={`Color: ${color}`}
            checked={Boolean(values[color])}
            onChange={() => toggle(color)}
          />
        ))}
      </Block>
      <Checkbox
        color="success"
        label="Default checked"
        defaultChecked
      />
      <Text variant="small" color="muted">
        Use `color` to match checkbox accents with message intent while keeping labels readable.
      </Text>
    </Block>
  );
}
