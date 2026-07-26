import type { TreeNode } from '@platform-blocks/ui';

/** Two-level technology groups, so cascading checks have parents to roll up into. */
export const TREE_DATA: TreeNode[] = [
  {
    id: 'frontend',
    label: 'Frontend Technologies',
    children: [
      {
        id: 'frameworks',
        label: 'Frameworks',
        children: [
          { id: 'react', label: 'React' },
          { id: 'vue', label: 'Vue.js' },
          { id: 'angular', label: 'Angular' },
        ],
      },
      {
        id: 'styling',
        label: 'Styling',
        children: [
          { id: 'css', label: 'CSS' },
          { id: 'sass', label: 'Sass' },
          { id: 'tailwind', label: 'Tailwind CSS' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend Technologies',
    children: [
      {
        id: 'languages',
        label: 'Languages',
        children: [
          { id: 'nodejs', label: 'Node.js' },
          { id: 'python', label: 'Python' },
          { id: 'go', label: 'Go' },
        ],
      },
      {
        id: 'databases',
        label: 'Databases',
        children: [
          { id: 'postgresql', label: 'PostgreSQL' },
          { id: 'mongodb', label: 'MongoDB' },
          { id: 'redis', label: 'Redis' },
        ],
      },
    ],
  },
];
