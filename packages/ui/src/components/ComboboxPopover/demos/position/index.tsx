import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} position="top-start">
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
