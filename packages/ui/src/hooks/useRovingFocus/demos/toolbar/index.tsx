import { useState } from 'react';
import { Block, IconButton, a11yProps, useRovingFocus } from '@plocks/ui';

const TOOLS = [
  { icon: 'bold', label: 'Bold' },
  { icon: 'italic', label: 'Italic' },
  { icon: 'underline', label: 'Underline' },
  { icon: 'strikethrough', label: 'Strikethrough' },
  { icon: 'code', label: 'Code' },
];

export function Demo() {
  const [active, setActive] = useState<string[]>(['Bold']);
  const { getItemProps } = useRovingFocus({ count: TOOLS.length });

  const toggle = (label: string) =>
    setActive((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );

  return (
    <Block
      direction="row"
      gap="xs"
      p="xs"
      radius="md"
      bg="subtle"
      {...a11yProps({ role: 'toolbar', label: 'Text formatting', orientation: 'horizontal' })}
    >
      {TOOLS.map((tool, index) => {
        const on = active.includes(tool.label);
        return (
          <IconButton
            key={tool.label}
            icon={tool.icon}
            variant={on ? 'filled' : 'ghost'}
            accessibilityLabel={tool.label}
            onPress={() => toggle(tool.label)}
            {...getItemProps(index)}
            {...a11yProps({ pressed: on })}
          />
        );
      })}
    </Block>
  );
}
