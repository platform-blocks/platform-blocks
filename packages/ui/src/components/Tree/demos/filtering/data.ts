import type { TreeNode } from '@platform-blocks/ui';

/** Enough labels sharing substrings ("Java"/"JavaScript") to make filtering visible. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'programming',
    label: 'Programming Languages',
    children: [
      {
        id: 'frontend',
        label: 'Frontend',
        children: [
          { id: 'javascript', label: 'JavaScript' },
          { id: 'typescript', label: 'TypeScript' },
          { id: 'html', label: 'HTML' },
          { id: 'css', label: 'CSS' },
        ],
      },
      {
        id: 'backend',
        label: 'Backend',
        children: [
          { id: 'python', label: 'Python' },
          { id: 'java', label: 'Java' },
          { id: 'csharp', label: 'C#' },
          { id: 'go', label: 'Go' },
        ],
      },
      {
        id: 'mobile',
        label: 'Mobile',
        children: [
          { id: 'swift', label: 'Swift' },
          { id: 'kotlin', label: 'Kotlin' },
          { id: 'dart', label: 'Dart' },
        ],
      },
    ],
  },
  {
    id: 'databases',
    label: 'Databases',
    children: [
      { id: 'mysql', label: 'MySQL' },
      { id: 'postgresql', label: 'PostgreSQL' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'redis', label: 'Redis' },
    ],
  },
];
