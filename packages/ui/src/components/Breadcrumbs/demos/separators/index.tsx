import { Block, Breadcrumbs, Icon } from '@platform-blocks/react-ui-library';

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Subcategory', href: '/category/subcategory' },
  { label: 'Product' },
];

export function Demo() {
  return (
    <Block>
      <Breadcrumbs items={ITEMS} />
      <Breadcrumbs items={ITEMS} separator=">" />
      <Breadcrumbs items={ITEMS} separator={<Icon name="chevron-right" size={14} />} />
      <Breadcrumbs items={ITEMS} separator="•" />
    </Block>
  );
}
