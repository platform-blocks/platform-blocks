import { Block, SegmentedControl } from '@platform-blocks/ui';

import { accountSections, frameworks, panes, priorities } from '../data';

const palettes = [
  { key: 'primary', color: 'primary', defaultValue: 'react', data: frameworks },
  { key: 'success', color: 'success', defaultValue: 'code', data: panes },
  { key: 'purple', color: 'purple', defaultValue: 'settings', data: accountSections },
  { key: 'custom', color: '#FF6B6B', defaultValue: 'medium', data: priorities },
];

export default function Demo() {
  return (
    <Block>
      {palettes.map((palette) => (
        <SegmentedControl
          key={palette.key}
          defaultValue={palette.defaultValue}
          color={palette.color}
          data={palette.data}
        />
      ))}
    </Block>
  );
}
