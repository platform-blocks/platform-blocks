import { useEffect, useState } from 'react';
import { Block, Progress } from '@platform-blocks/ui';

import { describe } from './describe';
import { TICK_MS, TOTAL_MB, stageFor } from './stages';

export default function Demo() {
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    // Hold on the completed state for a beat, then start the run over.
    if (value >= 100) {
      const restart = setTimeout(() => setValue(0), 1800);
      return () => clearTimeout(restart);
    }

    const tick = setTimeout(() => {
      setValue((current) => Math.min(100, current + stageFor(current).speed));
    }, TICK_MS);
    return () => clearTimeout(tick);
  }, [value]);

  const done = value >= 100;
  const stage = stageFor(value);

  return (
    <Block fullWidth>
      <Progress
        value={value}
        label={done ? 'Upload complete' : `${stage.label} — ${Math.round(value)}%`}
        description={done ? `18 files · ${TOTAL_MB} MB` : describe(value)}
        color={done ? 'success' : stage.color}
        striped={!done && stage.striped}
        animate={!done && stage.striped}
        transitionDuration={TICK_MS + 20}
        size="lg"
        radius="xl"
      />
    </Block>
  );
}
