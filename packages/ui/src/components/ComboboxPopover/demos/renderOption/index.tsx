import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} renderOption={({ option }) => option.label.toUpperCase()}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
