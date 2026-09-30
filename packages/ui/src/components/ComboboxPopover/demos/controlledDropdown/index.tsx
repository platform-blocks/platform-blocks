import { useState } from 'react';
import { Button, ComboboxPopover } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <ComboboxPopover
      data={['Apple', 'Banana']}
      dropdownOpened={opened}
      onDropdownOpen={() => setOpened(true)}
      onDropdownClose={() => setOpened(false)}
    >
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
