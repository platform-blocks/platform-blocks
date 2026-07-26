import { useState } from 'react';
import { Block, Checkbox } from '@platform-blocks/ui';

export default function Demo() {
  const [checked, setChecked] = useState(false);

  return (
    <Block w={600}>
    <Checkbox
      label="Accept terms and conditions"
      description={checked ? 'Thanks! You can proceed to the next step.' : 'Check the box to continue.'}
      checked={checked}
      onChange={setChecked}
    />
    </Block>
  );
}
