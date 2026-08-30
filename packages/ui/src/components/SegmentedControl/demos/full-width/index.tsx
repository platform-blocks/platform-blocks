import { SegmentedControl, Text } from '@platform-blocks/react-ui-library';
import { panes } from '../data';

export function Demo() {
  return (
    <SegmentedControl fullWidth defaultValue="preview" data={panes} />
  );
}
