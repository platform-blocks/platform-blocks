import { useState } from 'react';

import { Block, PinInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [fourDigit, setFourDigit] = useState('');
  const [sixDigit, setSixDigit] = useState('');
  const [eightDigit, setEightDigit] = useState('');

  const lengthExamples = [
    {
      length: 4,
      title: '4-digit PIN (default)',
      helper: 'Common for ATM and device security codes.',
      label: '4-digit PIN',
      value: fourDigit,
      setValue: setFourDigit,
    },
    {
      length: 6,
      title: '6-digit verification',
      helper: 'Typical for SMS-based one-time codes.',
      label: 'Verification code',
      value: sixDigit,
      setValue: setSixDigit,
    },
    {
      length: 8,
      title: '8-digit code',
      helper: 'Use for longer recovery or backup codes.',
      label: 'Security code',
      value: eightDigit,
      setValue: setEightDigit,
    },
  ];

  return (
    <Block>
      <Text weight="semibold">PIN input lengths</Text>
      {lengthExamples.map((example) => (
        <Block key={example.length}>
          <Text size="sm" weight="semibold">
            {example.title}
          </Text>
          <Text size="sm" color="secondary">
            {example.helper}
          </Text>
          <PinInput
            value={example.value}
            onChange={example.setValue}
            length={example.length}
            label={example.label}
          />
        </Block>
      ))}
    </Block>
  );
}


