import { Button, ComboboxPopover } from '@plocks/ui';

const data = Array.from({ length: 100 }, (_, index) => `Option ${index + 1}`);

export function Demo() {
  return (
    <ComboboxPopover data={data} maxDropdownHeight={180}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
