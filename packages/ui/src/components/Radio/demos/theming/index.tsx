import { useState } from 'react';
import { Block, Radio, RadioGroup, Text } from '@platform-blocks/ui';

const COLOR_OPTIONS = ['primary', 'secondary', 'success', 'error'] as const;

export default function Demo() {
  const [sizeValue, setSizeValue] = useState<string>('club');
  const [colorValue, setColorValue] = useState<typeof COLOR_OPTIONS[number]>('primary');

  return (
    <Block>
      <Block>
        <Text variant="small" colorVariant="muted">
          Size tokens
        </Text>
        <RadioGroup
          size="sm"
          value={sizeValue}
          onChange={setSizeValue}
          options={[
            { label: 'Club', value: 'club' },
            { label: 'Suite', value: 'suite' },
            { label: 'Field level', value: 'field' }
          ]}
        />
      </Block>

      <Block>
        <Text variant="small" colorVariant="muted">
          Semantic colors
        </Text>
        <Block>
          {COLOR_OPTIONS.map((tone) => (
            <Radio
              key={tone}
              value={tone}
              checked={colorValue === tone}
              onChange={(value) => setColorValue(value as typeof COLOR_OPTIONS[number])}
              label={`${tone.charAt(0).toUpperCase()}${tone.slice(1)} tickets`}
              color={tone}
            />
          ))}
        </Block>
      </Block>

      <Block>
        <Text variant="small" colorVariant="muted">
          Common states
        </Text>
        <Radio value="available" checked label="Available" />
        <Radio value="disabled" disabled label="Disabled" />
        <Radio value="error" error="Select a seat" label="Needs attention" />
      </Block>
    </Block>
  );
}


