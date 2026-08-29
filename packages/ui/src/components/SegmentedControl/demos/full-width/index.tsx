import { SegmentedControl, Text } from '@platform-blocks/ui';
import { panes } from '../data';

export function Demo() {
  return (
    <SegmentedControl fullWidth defaultValue="preview" data={panes} />
  );
}
