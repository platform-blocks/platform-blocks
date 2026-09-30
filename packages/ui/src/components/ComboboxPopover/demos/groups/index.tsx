import { Button, ComboboxPopover } from '@plocks/ui';

const data = [
  { group: 'Fruit', items: ['Apple', 'Banana'] },
  { group: 'Vegetables', items: ['Carrot', 'Pea'] },
];

export function Demo() {
  return (
    <ComboboxPopover data={data}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
