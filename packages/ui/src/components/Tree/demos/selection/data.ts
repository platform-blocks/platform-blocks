import type { TreeNode } from '@platform-blocks/ui';

/** A catalogue tree with both nested and flat branches to select across. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'products',
    label: 'Products',
    children: [
      {
        id: 'electronics',
        label: 'Electronics',
        children: [
          { id: 'laptop', label: 'Laptops' },
          { id: 'phone', label: 'Smartphones' },
          { id: 'tablet', label: 'Tablets' },
        ],
      },
      {
        id: 'clothing',
        label: 'Clothing',
        children: [
          { id: 'shirts', label: 'Shirts' },
          { id: 'pants', label: 'Pants' },
          { id: 'shoes', label: 'Shoes' },
        ],
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    children: [
      { id: 'support', label: 'Customer Support' },
      { id: 'consulting', label: 'Consulting' },
      { id: 'training', label: 'Training' },
    ],
  },
];
