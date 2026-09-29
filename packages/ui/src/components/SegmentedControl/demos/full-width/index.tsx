import { SegmentedControl } from '@platform-blocks/ui';

export function Demo() {
  return (
    <SegmentedControl fullWidth defaultValue="Preview" data={['Preview', 'Code', 'Export']} />
  );
}
