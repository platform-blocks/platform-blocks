import { Block, SegmentedControl } from '@platform-blocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Block>
      <SegmentedControl label="Default" variant="default" defaultValue="React" data={data} />
      <SegmentedControl label="Filled" variant="filled" defaultValue="React" data={data} />
      <SegmentedControl label="Outline" variant="outline" color="secondary" defaultValue="React" data={data} />
      <SegmentedControl label="Ghost" variant="ghost" color="success" defaultValue="React" data={data} />
    </Block>
  );
}
