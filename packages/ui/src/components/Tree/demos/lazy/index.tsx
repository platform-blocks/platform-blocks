import { Tree, type TreeNode } from '@platform-blocks/ui';

import { TREE_DATA, fetchInstances, fetchVolumes } from './data';

export function Demo() {
  const loadChildren = (node: TreeNode) =>
    node.id.includes('-web') ? fetchVolumes(node.id) : fetchInstances(node.id);

  return <Tree data={TREE_DATA} loadChildren={loadChildren} selectionMode="single" showGuides />;
}
