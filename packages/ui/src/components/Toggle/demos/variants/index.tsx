import { Column, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

const variants = ['solid', 'ghost'] as const;

export function Demo() {
  return (
    <Column gap="lg">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text fw="semibold">{variant}</Text>
          <ToggleGroup variant={variant} defaultValue="center" exclusive accessibilityLabel={`${variant} alignment`}>
            <ToggleButton value="left">Left</ToggleButton>
            <ToggleButton value="center">Center</ToggleButton>
            <ToggleButton value="right">Right</ToggleButton>
          </ToggleGroup>
        </Column>
      ))}
    </Column>
  );
}
