import { SegmentedControl } from '@plocks/ui';

export function Demo() {
  return (
    <SegmentedControl fullWidth defaultValue="Preview" data={['Preview', 'Code', 'Export']} />
  );
}
