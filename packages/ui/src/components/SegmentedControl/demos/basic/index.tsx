import { SegmentedControl } from '@platform-blocks/ui';

const frameworks = [
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Vue', value: 'vue' },
];

export function Demo() {
  return (
    <SegmentedControl defaultValue="react" data={frameworks} />
  );
}
