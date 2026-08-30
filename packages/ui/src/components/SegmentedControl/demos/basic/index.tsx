import { SegmentedControl, Text } from '@platform-blocks/react-ui-library';
import { frameworks } from '../data';

export function Demo() {
  return (
    <SegmentedControl defaultValue="react" data={frameworks} />
  );
}
