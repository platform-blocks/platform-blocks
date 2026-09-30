import React, { useState } from 'react';
import { StickyNote } from '@plocks/ui';

export function Demo() {
  const [done, setDone] = useState(false);

  return (
    <StickyNote
      title={done ? 'Done!' : 'To do'}
      color={done ? 'green' : 'purple'}
      accessibilityLabel={done ? 'Mark note as to do' : 'Mark note as done'}
      onPress={() => setDone(value => !value)}
    >
      {done ? 'Tap to reopen this task.' : 'Tap this note when the task is complete.'}
    </StickyNote>
  );
}
