import { Tree } from '@platform-blocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  return <Tree data={TREE_DATA} virtualized height={320} size="sm" striped showGuides />;
}
