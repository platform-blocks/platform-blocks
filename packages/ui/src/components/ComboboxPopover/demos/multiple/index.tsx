import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} multiple defaultValue={['Apple']}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
