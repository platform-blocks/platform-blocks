import { ToggleButton, ToggleGroup } from '@plocks/ui';

export function Demo() {
  return (
    <ToggleGroup defaultValue="center" exclusive>
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
      <ToggleButton value="justify">Justify</ToggleButton>
    </ToggleGroup>
  );
}
