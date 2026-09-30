import { Block, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Block>
      <SegmentedControl color="primary" defaultValue="React" data={data} />
      <SegmentedControl color="success" defaultValue="React" data={data} />
      <SegmentedControl color="purple" defaultValue="React" data={data} />
      <SegmentedControl color="#FF6B6B" autoContrast defaultValue="React" data={data} />
    </Block>
  );
}
