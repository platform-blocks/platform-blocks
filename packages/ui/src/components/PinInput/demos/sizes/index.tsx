import { useState } from 'react';

import { Block, PinInput, Text } from '@platform-blocks/ui';

type SizeToken = 'xs' | 'sm' | 'md' | 'lg';

export default function Demo() {
  const [xsValue, setXsValue] = useState('');
  const [smValue, setSmValue] = useState('');
  const [mdValue, setMdValue] = useState('');
  const [lgValue, setLgValue] = useState('');

  const sizeExamples: Array<{
    id: SizeToken;
    label: string;
    helper: string;
    size: SizeToken;
    value: string;
    setValue: (value: string) => void;
  }> = [
    {
      id: 'xs',
      label: 'Extra small (xs)',
      helper: 'Use for dense layouts or compact verification prompts.',
      size: 'xs',
      value: xsValue,
      setValue: setXsValue,
    },
    {
      id: 'sm',
      label: 'Small (sm)',
      helper: 'Pairs well with mobile forms and inline flows.',
      size: 'sm',
      value: smValue,
      setValue: setSmValue,
    },
    {
      id: 'md',
      label: 'Medium (md)',
      helper: 'Default size for most experiences.',
      size: 'md',
      value: mdValue,
      setValue: setMdValue,
    },
    {
      id: 'lg',
      label: 'Large (lg)',
      helper: 'Highlight critical actions with spacious fields.',
      size: 'lg',
      value: lgValue,
      setValue: setLgValue,
    },
  ];

  return (
    <Block>
      <Text weight="semibold">PIN input sizes</Text>

      {sizeExamples.map((example) => (
        <Block key={example.id}>
          <Text size="sm" weight="semibold">
            {example.label}
          </Text>
          <Text size="sm" colorVariant="secondary">
            {example.helper}
          </Text>
          <PinInput
            value={example.value}
            onChange={example.setValue}
            size={example.size}
            label={`${example.label} PIN`}
          />
        </Block>
      ))}
    </Block>
  );
}


