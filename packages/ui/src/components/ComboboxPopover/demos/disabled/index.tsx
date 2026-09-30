import { Button, ComboboxPopover } from '@plocks/ui';

const data = [{ value: 'Apple' }, { value: 'Banana', disabled: true }, { value: 'Cherry' }];

export function Demo() {
  return (
    <ComboboxPopover data={data}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
