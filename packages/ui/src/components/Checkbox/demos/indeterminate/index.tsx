import { useState } from 'react';
import { Block, Checkbox } from '@plocks/ui';

const ITEMS = [
  { id: 1, label: 'Email notifications' },
  { id: 2, label: 'SMS alerts' },
  { id: 3, label: 'Push notifications' },
];

export function Demo() {
  const [selected, setSelected] = useState<number[]>([1]);
  const allIds = ITEMS.map((item) => item.id);
  const allChecked = selected.length === ITEMS.length;
  const someChecked = selected.length > 0 && !allChecked;

  const toggleAll = () => {
    setSelected((current) => (current.length === ITEMS.length ? [] : allIds));
  };

  const toggleItem = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  };

  return (
    <Block>
      <Checkbox
        label="Select all"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={toggleAll}
      />
      <Block pl="md">
        {ITEMS.map(({ id, label }) => (
          <Checkbox
            key={id}
            label={label}
            checked={selected.includes(id)}
            onChange={() => toggleItem(id)}
          />
        ))}
      </Block>
    </Block>
  );
}
