import { Block, Card, SegmentedControl } from '@platform-blocks/react-ui-library';

import { frameworks, languages, panes, priorities } from '../data';

const scenarios = [
  { key: 'default', label: 'Interactive', props: {}, defaultValue: 'react', data: frameworks },
  { key: 'disabled', label: 'Disabled', props: { disabled: true }, defaultValue: 'code', data: panes },
  { key: 'readOnly', label: 'Read only', props: { readOnly: true }, defaultValue: 'medium', data: priorities },
  // `languages` carries the disabled flag on its last item.
  { key: 'itemDisabled', label: 'Single option disabled', props: {}, defaultValue: 'typescript', data: languages },
];

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Block>
          {scenarios.map((scenario) => (
            <SegmentedControl
              key={scenario.key}
              label={scenario.label}
              defaultValue={scenario.defaultValue}
              data={scenario.data}
              {...scenario.props}
            />
          ))}
        </Block>
      </Block>
    </Card>
  );
}
