import type { TreeNode } from '@platform-blocks/ui';

/** Payload each node carries on `node.data` for the custom label renderer. */
export interface CustomNodeData {
  status: 'active' | 'inactive' | 'pending';
  count?: number;
  type: 'folder' | 'file' | 'project';
}

/** A workspace whose nodes cover every status and an empty branch. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    data: { status: 'active', type: 'folder', count: 3 },
    children: [
      {
        id: 'project-a',
        label: 'Project Alpha',
        data: { status: 'active', type: 'project', count: 12 },
        children: [
          {
            id: 'file-1',
            label: 'main.ts',
            data: { status: 'active', type: 'file' }
          },
          {
            id: 'file-2',
            label: 'config.json',
            data: { status: 'pending', type: 'file' }
          },
          {
            id: 'file-3',
            label: 'README.md',
            data: { status: 'active', type: 'file' }
          },
        ],
      },
      {
        id: 'project-b',
        label: 'Project Beta',
        data: { status: 'pending', type: 'project', count: 5 },
        children: [
          {
            id: 'file-4',
            label: 'app.tsx',
            data: { status: 'inactive', type: 'file' }
          },
          {
            id: 'file-5',
            label: 'styles.css',
            data: { status: 'active', type: 'file' }
          },
        ],
      },
      {
        id: 'project-c',
        label: 'Project Gamma',
        data: { status: 'inactive', type: 'project', count: 0 },
        children: [],
      },
    ],
  },
];

/** Icon shown ahead of a node's label, keyed by node type. */
export const TYPE_ICONS: Record<CustomNodeData['type'], string> = {
  folder: 'folder',
  project: 'sheild',
  file: 'file',
};

/** Badge copy and colour for each status, also driving the legend above the tree. */
export const STATUS_BADGES: Record<CustomNodeData['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  inactive: { label: 'Inactive', color: 'gray' },
};
