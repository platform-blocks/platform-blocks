import { SegmentedControl, Text } from '@platform-blocks/ui';
import { frameworks } from '../data';

export function Demo() {
  return (
    <SegmentedControl defaultValue="react" data={frameworks} />
  );
}
