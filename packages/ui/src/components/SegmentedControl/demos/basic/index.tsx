import { SegmentedControl, Text } from '@platform-blocks/ui';
import { frameworks } from '../data';

export default function Demo() {
  return (
    <SegmentedControl defaultValue="react" data={frameworks} />
  );
}
