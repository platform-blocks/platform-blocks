import { Breadcrumbs } from '@platform-blocks/ui';

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Smartphones' },
];

export function Demo() {
  return <Breadcrumbs items={ITEMS} />;
}
