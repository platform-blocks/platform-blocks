import { Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  return <Tree data={TREE_DATA} virtualized h={320} size="sm" striped showGuides />;
}
