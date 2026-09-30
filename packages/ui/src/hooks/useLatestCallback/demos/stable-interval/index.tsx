import { useEffect, useState } from 'react';
import { Block, SegmentedControl, Text, useLatestCallback } from '@plocks/ui';

const STEPS = [
  { label: '+1', value: '1' },
  { label: '+5', value: '5' },
  { label: '+10', value: '10' },
];

export function Demo() {
  const [step, setStep] = useState('1');
  const [count, setCount] = useState(0);

  const tick = useLatestCallback(() => setCount((c) => c + Number(step)));

  // `tick` never changes identity, so the interval is created once.
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <Block align="center">
      <Text size="xl" fw="700">
        {count}
      </Text>
      <SegmentedControl data={STEPS} value={step} onChange={setStep} />
    </Block>
  );
}
