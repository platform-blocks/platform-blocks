import { Row, SegmentedControl } from '@plocks/ui';

const data = ['React', 'Angular', 'Vue'];

export function Demo() {
  return (
    <Row gap="lg" align="flex-start" wrap="wrap">
      <SegmentedControl
        label="Horizontal (default)"
        orientation="horizontal"
        defaultValue="React"
        data={data}
      />
      <SegmentedControl
        label="Vertical"
        orientation="vertical"
        defaultValue="React"
        data={data}
      />
    </Row>
  );
}
