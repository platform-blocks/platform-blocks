import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} defaultValue="Apple" checkIconPosition="end" withAlignedLabels>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
