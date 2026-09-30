import { Tree } from '@plocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  return <Tree data={TREE_DATA} collapsible indent={20} />;
}
