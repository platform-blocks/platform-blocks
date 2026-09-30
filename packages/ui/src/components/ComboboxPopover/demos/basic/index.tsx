import { Button, ComboboxPopover } from '@plocks/ui';

export function Demo() {
  return (
    <ComboboxPopover data={['Apple', 'Banana', 'Cherry', 'Date']} searchable>
      <ComboboxPopover.Target>
        <Button>Select fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
