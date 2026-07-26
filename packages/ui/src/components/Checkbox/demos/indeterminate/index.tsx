import { useState } from 'react';
import { Block, Checkbox } from '@platform-blocks/ui';
import { ITEMS } from './data';

export default function Demo() {
  const [selected, setSelected] = useState<number[]>([]);
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
        label={`Select all (${selected.length}/${ITEMS.length})`}
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
