import { Block, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Block>
      <SegmentedControl label="Disabled" disabled defaultValue="React" data={data} />
      <SegmentedControl label="Read only" readOnly defaultValue="React" data={data} />
      <SegmentedControl
        label="Single option disabled"
        defaultValue="React"
        data={['React', 'Angular', { label: 'Vue', value: 'Vue', disabled: true }]}
      />
    </Block>
  );
}
