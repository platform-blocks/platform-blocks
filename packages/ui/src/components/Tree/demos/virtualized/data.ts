import type { TreeNode } from '@platform-blocks/ui';

const DEPARTMENTS = ['Engineering', 'Design', 'Sales', 'Support', 'Finance', 'Legal'];

/** ~1,500 rows: large enough that rendering every one of them would be felt. */
export const TREE_DATA: TreeNode[] = DEPARTMENTS.map((department, d) => ({
  id: `dept-${d}`,
  label: department,
  startOpen: d === 0,
  children: Array.from({ length: 15 }, (_, t) => ({
    id: `dept-${d}-team-${t}`,
    label: `${department} team ${t + 1}`,
    children: Array.from({ length: 16 }, (_, m) => ({
      id: `dept-${d}-team-${t}-member-${m}`,
      label: `Member ${t + 1}.${m + 1}`,
    })),
  })),
}));
