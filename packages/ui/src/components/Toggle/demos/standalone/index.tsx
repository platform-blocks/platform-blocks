import { useState } from 'react';

import { ToggleButton } from '@platform-blocks/ui';

export function Demo() {
  const [selected, setSelected] = useState(false);

  return (
    <ToggleButton
      value="favorite"
      selected={selected}
      onPress={() => setSelected((current) => !current)}
    >
      Mark favorite
    </ToggleButton>
  );
}
