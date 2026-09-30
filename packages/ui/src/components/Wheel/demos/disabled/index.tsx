import { Wheel } from '@plocks/ui';

const options = [
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Large', label: 'Large' },
];

export function Demo() {
  return <Wheel items={options} value="Medium" label="Size" disabled />;
}
