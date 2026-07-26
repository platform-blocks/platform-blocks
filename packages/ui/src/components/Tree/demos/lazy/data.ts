import type { TreeNode } from '@platform-blocks/ui';

/** Roots that advertise children with `hasChildren` but ship none — `loadChildren` fills them in. */
export const TREE_DATA: TreeNode[] = [
  { id: 'us-east-1', label: 'us-east-1', hasChildren: true },
  { id: 'eu-west-1', label: 'eu-west-1', hasChildren: true },
  { id: 'ap-south-1', label: 'ap-south-1', hasChildren: true },
];

/** Stands in for the API call a real app would make. */
export const fetchInstances = (regionId: string): Promise<TreeNode[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: `${regionId}-web`, label: 'web-server', hasChildren: true },
        { id: `${regionId}-db`, label: 'database' },
        { id: `${regionId}-cache`, label: 'cache' },
      ]);
    }, 700);
  });

export const fetchVolumes = (instanceId: string): Promise<TreeNode[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: `${instanceId}-vol-1`, label: 'volume-1 (100 GiB)' },
        { id: `${instanceId}-vol-2`, label: 'volume-2 (500 GiB)' },
      ]);
    }, 700);
  });
