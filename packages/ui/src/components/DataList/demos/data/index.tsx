import { DataList } from '@platform-blocks/react-ui-library';

const details = [
  { label: 'Order', value: '#SS-10428' },
  { label: 'Placed', value: 'July 3, 2026' },
  { label: 'Total', value: '$248.00' },
  { label: 'Payment', value: 'Visa •••• 4242' },
];

export function Demo() {
  return <DataList data={details} withDivider labelWidth={100} />;
}
